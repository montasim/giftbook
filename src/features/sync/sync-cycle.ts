import { TABLE_NAMES, type TableName } from "../ledger/schema.ts"
import type { LedgerData } from "../ledger/queries.ts"
import type { SheetsApi } from "../google/types.ts"
import { assertHeaders, fromRow, toRow } from "./rows.ts"
import { merge } from "./merge.ts"

// এক চক্র: pull → merge → save → push। db বাইরে থেকে (Dexie বা মেমরি) — টেস্টযোগ্য।
export type CycleDb = { getAll: () => Promise<LedgerData>; save: (toSave: Partial<LedgerData>) => Promise<void> }
export type CycleResult = { pulled: Record<TableName, number>; saved: number; updated: number; appended: number; rejected: { table: TableName; row: string[] }[] }
type Row = { id: string; updatedAt: string }

export async function syncOnce({ api, db, fileId }: { api: SheetsApi; db: CycleDb; fileId: string }): Promise<CycleResult> {
  // 1. pull
  const { valueRanges } = await api.batchGet(fileId)
  const remote = {} as Record<TableName, Row[]>
  const rowOf = {} as Record<TableName, Map<string, number>>
  const rejected: CycleResult["rejected"] = []
  TABLE_NAMES.forEach((t, i) => {
    const [header = [], ...rows] = valueRanges[i]?.values ?? []
    assertHeaders(t, header)
    remote[t] = []
    rowOf[t] = new Map()
    rows.forEach((row, idx) => {
      const r = fromRow(t, row)
      if (!r.ok) return rejected.push({ table: t, row })
      const v = r.value as unknown as Row
      if (rowOf[t].has(v.id)) return // ডুপ্লিকেট id → প্রথম সারিটাই সত্য
      rowOf[t].set(v.id, idx + 2)
      remote[t].push(v)
    })
  })

  // 2. merge
  const local = await db.getAll()
  const plan = Object.fromEntries(TABLE_NAMES.map((t) => [t, merge(local[t] as Row[], remote[t])])) as Record<TableName, { toPush: Row[]; toSave: Row[] }>

  // 3. save
  const toSave: Partial<LedgerData> = {}
  for (const t of TABLE_NAMES) if (plan[t].toSave.length) (toSave as Record<string, unknown>)[t] = plan[t].toSave
  if (Object.keys(toSave).length) await db.save(toSave)

  // 4. push: আছে → batchUpdate; নেই → append
  const updates: { range: string; values: string[][] }[] = []
  const appends: Partial<Record<TableName, string[][]>> = {}
  for (const t of TABLE_NAMES) {
    for (const o of plan[t].toPush) {
      const row = rowOf[t].get(o.id)
      if (row) updates.push({ range: `${t}!A${row}`, values: [toRow(t, o)] })
      else (appends[t] ??= []).push(toRow(t, o))
    }
  }
  if (updates.length) await api.batchUpdate(fileId, updates)
  for (const [t, values] of Object.entries(appends)) if (values?.length) await api.append(fileId, t, values)

  return {
    pulled: Object.fromEntries(TABLE_NAMES.map((t) => [t, remote[t].length])) as Record<TableName, number>,
    saved: TABLE_NAMES.reduce((n, t) => n + plan[t].toSave.length, 0),
    updated: updates.length,
    appended: Object.values(appends).reduce((n, v) => n + (v?.length ?? 0), 0),
    rejected,
  }
}

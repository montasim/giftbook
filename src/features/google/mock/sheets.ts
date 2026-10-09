import { TABLE_NAMES, columnsOf } from "../../ledger/schema.ts"
import type { SheetsApi } from "../types.ts"

// Google Sheets-এর ৪টা কলের হুবহু আকারে মক। storage: localStorage বা Map (টেস্ট)।
export type KV = { get: (k: string) => string | null; set: (k: string, v: string) => void }
type Sheet = Record<string, { header: string[]; rows: string[][] }>

export function createMockSheets(storage?: KV, { tamper = false } = {}): SheetsApi & { createSpreadsheet: (fileId: string) => void } {
  const st: KV = storage ?? { get: (k) => localStorage.getItem(k), set: (k, v) => localStorage.setItem(k, v) }
  const key = (fileId: string) => `sheet-${fileId}`
  const empty = (): Sheet => Object.fromEntries(TABLE_NAMES.map((t) => [t, { header: columnsOf(t), rows: [] }]))
  const save = (fileId: string, sheet: Sheet) => st.set(key(fileId), JSON.stringify(sheet))
  const load = (fileId: string): Sheet => {
    const raw = st.get(key(fileId))
    if (!raw) {
      const s = empty()
      save(fileId, s)
      return s
    }
    return JSON.parse(raw) as Sheet
  }
  const tab = (sheet: Sheet, t: string) => (sheet[t] ??= { header: columnsOf(t as "gifts"), rows: [] })
  return {
    createSpreadsheet: (fileId) => save(fileId, empty()),
    async batchGet(fileId) {
      const sheet = load(fileId)
      return {
        valueRanges: TABLE_NAMES.map((t) => {
          const { header, rows } = tab(sheet, t)
          return { range: `${t}!A1:Z`, values: [tamper && t === "gifts" ? header.slice(0, -1) : header, ...rows] }
        }),
      }
    },
    async batchUpdate(fileId, data) {
      const sheet = load(fileId)
      for (const { range, values } of data) {
        const [t = "", a1 = "A2"] = range.split("!")
        tab(sheet, t).rows[Number(a1.slice(1)) - 2] = values[0] ?? [] // সারি ১ = হেডার
      }
      save(fileId, sheet)
      return { totalUpdatedRows: data.length }
    },
    async append(fileId, t, values) {
      const sheet = load(fileId)
      tab(sheet, t).rows.push(...values)
      save(fileId, sheet)
      return { updates: { updatedRows: values.length } }
    },
  }
}

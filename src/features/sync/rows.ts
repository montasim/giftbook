import { TABLES, columnsOf, type TableName } from "../ledger/schema.ts"

export const toRow = (t: TableName, o: Record<string, unknown>) => columnsOf(t).map((c) => (o[c] == null ? "" : String(o[c])))

// ভুল সারি → { ok: false } (বাদ, কিন্তু রিপোর্ট)
export function fromRow(t: TableName, row: string[]): { ok: true; value: Record<string, unknown> } | { ok: false; row: string[] } {
  const o: Record<string, unknown> = Object.fromEntries(columnsOf(t).map((c, i) => [c, row[i] ?? ""]))
  o.deletedAt = o.deletedAt || null
  if (t === "gifts") o.amount = o.amount === "" ? null : Number(o.amount)
  const r = TABLES[t].safeParse(o)
  return r.success ? { ok: true, value: r.data } : { ok: false, row }
}

// শুধু প্রথম N কলাম মেলাও — ডানে বাড়তি কলাম ভাঙবে না
export function assertHeaders(t: TableName, header: string[]) {
  const want = columnsOf(t)
  if (want.some((c, i) => header[i] !== c)) throw new Error(`sheet-tampered:${t}`)
}

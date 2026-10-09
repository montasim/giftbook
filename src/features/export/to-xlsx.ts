import * as XLSX from "xlsx"
import { t } from "@/lib/i18n/bn"
import { formatPartialDate } from "@/lib/format"
import { totals, type GiftWithPerson } from "@/features/ledger/queries"
import type { LedgerEvent } from "@/features/ledger/schema"

type Row = Record<string, string | number>
const row = (g: GiftWithPerson, extra: Row = {}): Row => ({
  ...extra,
  [t.xlsx.name]: g.person?.name ?? "",
  [t.xlsx.phone]: g.person?.phone ?? "",
  [t.xlsx.direction]: g.direction === "received" ? t.event.received : t.event.given,
  [t.xlsx.amount]: g.amount ?? "",
  [t.xlsx.item]: g.item,
  [t.xlsx.note]: g.note,
})
const totalRow = (gifts: GiftWithPerson[], extra: Row = {}): Row => {
  const s = totals(gifts)
  return { ...extra, [t.xlsx.name]: t.xlsx.total, [t.xlsx.direction]: `${t.event.received} ${s.received} / ${t.event.given} ${s.given}`, [t.xlsx.amount]: s.net }
}
function write(rows: Row[], sheetName: string, fileName: string) {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), sheetName)
  XLSX.writeFile(wb, `${fileName}.xlsx`)
}

export const exportEventXlsx = (event: LedgerEvent, gifts: GiftWithPerson[]) => write([...gifts.map((g) => row(g)), totalRow(gifts)], t.xlsx.event, event.name)

export function exportLedgerXlsx(name: string, events: LedgerEvent[], giftsOf: (eventId: string) => GiftWithPerson[]) {
  const rows: Row[] = []
  for (const e of events) {
    const gifts = giftsOf(e.id)
    const extra = { [t.xlsx.event]: e.name, [t.xlsx.date]: formatPartialDate(e.date) }
    rows.push(...gifts.map((g) => row(g, extra)), totalRow(gifts, extra))
  }
  write(rows, t.appName, name)
}

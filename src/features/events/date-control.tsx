import { useState } from "react"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { t } from "@/lib/i18n"
import { datePrecision, formatPartialDate, toAsciiDigits, today, type DatePrecision } from "@/lib/format"
import { DATE_RE } from "@/features/ledger/schema"

// "শুধু সাল জানি" → year / month / day: native input, নিচে বাংলা প্রিভিউ
export function DateControl({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [precision, setPrecision] = useState<DatePrecision>(() => datePrecision(value))
  const [parts, setParts] = useState({ day: value.length === 10 ? value : today(), month: value.length === 7 ? value : today().slice(0, 7), year: value.slice(0, 4) })
  const emit = (p: DatePrecision, next = parts) => onChange(p === "year" ? toAsciiDigits(next.year).trim() : next[p])
  const current = precision === "year" ? toAsciiDigits(parts.year).trim() : parts[precision]
  return (
    <div className="flex flex-col gap-2">
      <ToggleGroup type="single" value={precision} onValueChange={(v) => { if (!v) return; const p = v as DatePrecision; setPrecision(p); emit(p) }} className="w-full rounded-lg bg-stone-100 p-1" spacing={0}>
        {(["day", "month", "year"] as const).map((p) => (
          <ToggleGroupItem key={p} value={p} className="h-8 flex-1 rounded-md text-xs data-[state=on]:bg-white data-[state=on]:shadow-sm">
            {t.event.precision[p]}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
      {precision === "day" && <Input type="date" value={parts.day} onChange={(e) => { const next = { ...parts, day: e.target.value }; setParts(next); emit("day", next) }} />}
      {precision === "month" && <Input type="month" value={parts.month} onChange={(e) => { const next = { ...parts, month: e.target.value }; setParts(next); emit("month", next) }} />}
      {precision === "year" && <Input type="text" inputMode="numeric" placeholder={t.event.yearPlaceholder} value={parts.year} onChange={(e) => { const next = { ...parts, year: e.target.value }; setParts(next); emit("year", next) }} />}
      <p className="text-sm text-stone-500">{DATE_RE.test(current) ? formatPartialDate(current) : " "}</p>
    </div>
  )
}

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AppIcon } from "@/components/common/app-icon"
import { Money } from "@/components/common/money"
import { StatusBadge } from "@/components/common/status-badge"
import { t } from "@/lib/i18n/bn"
import { cn } from "@/lib/utils"
import { isPending, type Direction } from "@/features/ledger/schema"
import type { GiftWithPerson } from "@/features/ledger/queries"

export type GiftSortKey = "person" | "direction" | "amount" | "item" | "note" | "updatedAt"
export type GiftSort = { key: GiftSortKey; dir: "asc" | "desc" }
export const DEFAULT_GIFT_SORT: GiftSort = { key: "updatedAt", dir: "desc" }

// সাজানো: নাম (bn locale) · দিক · টাকা (null শেষে) · জিনিস · নোট · সময়
export function sortGifts(gifts: GiftWithPerson[], sort: GiftSort): GiftWithPerson[] {
  const m = sort.dir === "asc" ? 1 : -1
  const str = (a: string, b: string) => a.localeCompare(b, "bn")
  const cmp: Record<GiftSortKey, (a: GiftWithPerson, b: GiftWithPerson) => number> = {
    person: (a, b) => str(a.person?.name ?? "", b.person?.name ?? ""),
    direction: (a, b) => str(a.direction, b.direction),
    amount: (a, b) => (a.amount == null && b.amount == null ? 0 : a.amount == null ? 1 : b.amount == null ? -1 : (a.amount - b.amount) * m),
    item: (a, b) => str(a.item, b.item),
    note: (a, b) => str(a.note, b.note),
    updatedAt: (a, b) => str(a.updatedAt, b.updatedAt),
  }
  return [...gifts].sort((a, b) => (sort.key === "amount" ? cmp.amount(a, b) : cmp[sort.key](a, b) * m) || cmp.updatedAt(b, a))
}

export const DirectionBadge = ({ direction }: { direction: Direction }) => (
  <StatusBadge tone={direction === "received" ? "success" : "warning"}>
    <AppIcon name={direction === "received" ? "in" : "out"} size={12} />
    {direction === "received" ? t.event.received : t.event.given}
  </StatusBadge>
)
const ItemCell = ({ g }: { g: GiftWithPerson }) => (isPending(g) ? <StatusBadge tone="warning">{t.gift.pending}</StatusBadge> : g.item ? <>{g.item}</> : <span className="text-stone-400">—</span>)

function SortHead({ label, k, sort, onSort, className }: { label: string; k: GiftSortKey; sort: GiftSort; onSort: (k: GiftSortKey) => void; className?: string }) {
  const active = sort.key === k
  return (
    <TableHead className={className} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
      <button type="button" onClick={() => onSort(k)} className={cn("inline-flex items-center gap-1 rounded hover:text-stone-900", active && "text-stone-900", className?.includes("text-right") && "flex-row-reverse")}>
        {label}
        <AppIcon name="chevronDown" size={12} className={cn("transition-transform", active ? (sort.dir === "asc" ? "rotate-180" : "") : "opacity-30")} />
      </button>
    </TableHead>
  )
}

// <640: সারি-বাটন · ≥640: টেবিল, হেডারে চাপলে সাজানো
export function GiftTable({ gifts, onRowClick, sort = DEFAULT_GIFT_SORT, onSort }: { gifts: GiftWithPerson[]; onRowClick: (g: GiftWithPerson) => void; sort?: GiftSort; onSort?: (k: GiftSortKey) => void }) {
  const sortFn = onSort ?? (() => {})
  return (
    <div>
      <div className="divide-y divide-stone-100 sm:hidden">
        {gifts.map((g) => (
          <button key={g.id} type="button" onClick={() => onRowClick(g)} className={cn("flex w-full items-center gap-3 px-4 py-3 text-left active:bg-stone-50", isPending(g) && "bg-amber-50/60")}>
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", g.direction === "received" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
              <AppIcon name={g.direction === "received" ? "in" : "out"} size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{g.person?.name ?? "—"}</span>
              {(isPending(g) || g.item || g.note) && (
                <span className="block truncate text-xs text-stone-500">
                  {isPending(g) ? <ItemCell g={g} /> : g.item}
                  {g.item && g.note && " · "}
                  {g.note}
                </span>
              )}
            </span>
            <Money value={g.amount} tone={g.direction} />
            <AppIcon name="chevronRight" size={16} className="text-stone-400" />
          </button>
        ))}
      </div>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHead label={t.gift.person} k="person" sort={sort} onSort={sortFn} />
              <SortHead label={t.gift.direction} k="direction" sort={sort} onSort={sortFn} />
              <SortHead label={t.gift.amount} k="amount" sort={sort} onSort={sortFn} className="text-right" />
              <SortHead label={t.gift.item} k="item" sort={sort} onSort={sortFn} />
              <SortHead label={t.gift.note} k="note" sort={sort} onSort={sortFn} className="hidden md:table-cell" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {gifts.map((g) => (
              <TableRow key={g.id} tabIndex={0} onClick={() => onRowClick(g)} onKeyDown={(e) => e.key === "Enter" && onRowClick(g)} className={cn("cursor-pointer", isPending(g) && "bg-amber-50/60")}>
                <TableCell className="font-medium">
                  {g.person?.name ?? "—"}
                  {g.updatedBy && <span className="block text-[11px] font-normal text-stone-400">{g.updatedBy}</span>}
                </TableCell>
                <TableCell><DirectionBadge direction={g.direction} /></TableCell>
                <TableCell className="text-right"><Money value={g.amount} tone={g.direction} /></TableCell>
                <TableCell><ItemCell g={g} /></TableCell>
                <TableCell className="hidden max-w-[12rem] truncate text-stone-500 md:table-cell">{g.note}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

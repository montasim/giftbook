import { Link } from "@tanstack/react-router"
import { collate } from "@/lib/format"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AppIcon } from "@/components/common/app-icon"
import { Money } from "@/components/common/money"
import { PartialDate } from "@/components/common/partial-date"
import { StatusBadge } from "@/components/common/status-badge"
import { DirectionBadge, SortHead } from "@/features/gifts/gift-table"
import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { isPending } from "@/features/ledger/schema"
import type { GiftWithEvent } from "@/features/ledger/queries"

export type HistorySortKey = "date" | "event" | "direction" | "amount" | "item"
export type HistorySort = { key: HistorySortKey; dir: "asc" | "desc" }
export const DEFAULT_HISTORY_SORT: HistorySort = { key: "date", dir: "desc" }

// সাজানো: তারিখ · অনুষ্ঠান (bn locale) · দিক · টাকা (null শেষে) · জিনিস; টাই → নতুনটা আগে
export function sortHistory(history: GiftWithEvent[], sort: HistorySort): GiftWithEvent[] {
  const m = sort.dir === "asc" ? 1 : -1
  const str = (a: string, b: string) => collate(a, b)
  const cmp: Record<HistorySortKey, (a: GiftWithEvent, b: GiftWithEvent) => number> = {
    date: (a, b) => str(a.event.date, b.event.date),
    event: (a, b) => str(a.event.name, b.event.name),
    direction: (a, b) => str(a.direction, b.direction),
    amount: (a, b) => (a.amount == null && b.amount == null ? 0 : a.amount == null ? 1 : b.amount == null ? -1 : (a.amount - b.amount) * m),
    item: (a, b) => str(a.item, b.item),
  }
  return [...history].sort((a, b) => (sort.key === "amount" ? cmp.amount(a, b) : cmp[sort.key](a, b) * m) || str(b.updatedAt, a.updatedAt))
}

const ItemCell = ({ g }: { g: GiftWithEvent }) => (isPending(g) ? <StatusBadge tone="warning">{t.gift.pending}</StatusBadge> : g.item ? <>{g.item}</> : <span className="text-stone-400">—</span>)

// এক মানুষের সব লেনদেন — <640: সারি-বাটন · ≥640: টেবিল, হেডারে চাপলে সাজানো (গিফট টেবিলের মতো)
export function PersonHistory({ history, onRowClick, sort = DEFAULT_HISTORY_SORT, onSort }: { history: GiftWithEvent[]; onRowClick: (g: GiftWithEvent) => void; sort?: HistorySort; onSort?: (k: HistorySortKey) => void }) {
  const sortFn = onSort ?? (() => {})
  return (
    <div>
      <div className="divide-y divide-stone-100 sm:hidden">
        {history.map((g) => (
          <button key={g.id} type="button" onClick={() => onRowClick(g)} className={cn("flex w-full items-center gap-3 px-4 py-3 text-left active:bg-stone-50", isPending(g) && "bg-amber-50/60")}>
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", g.direction === "received" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
              <AppIcon name={g.direction === "received" ? "in" : "out"} size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium">{g.event.name}</span>
              <span className="block truncate text-xs text-stone-500">
                <PartialDate value={g.event.date} />
                {(isPending(g) || g.item) && " · "}
                {isPending(g) ? <ItemCell g={g} /> : g.item}
              </span>
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
              <SortHead label={t.event.date} k="date" sort={sort} onSort={sortFn} />
              <SortHead label={t.xlsx.event} k="event" sort={sort} onSort={sortFn} />
              <SortHead label={t.gift.direction} k="direction" sort={sort} onSort={sortFn} />
              <SortHead label={t.gift.amount} k="amount" sort={sort} onSort={sortFn} className="text-right" />
              <SortHead label={t.gift.item} k="item" sort={sort} onSort={sortFn} />
              <TableHead className="hidden md:table-cell">{t.gift.note}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((g) => (
              <TableRow key={g.id} tabIndex={0} onClick={() => onRowClick(g)} onKeyDown={(e) => e.key === "Enter" && onRowClick(g)} className={cn("cursor-pointer", isPending(g) && "bg-amber-50/60")}>
                <TableCell className="whitespace-nowrap text-stone-500"><PartialDate value={g.event.date} /></TableCell>
                <TableCell className="font-medium">
                  <Link to="/events/$eventId" params={{ eventId: g.event.id }} className="hover:underline" onClick={(e) => e.stopPropagation()}>
                    {g.event.name}
                  </Link>
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

import { Link } from "@tanstack/react-router"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AppIcon } from "@/components/common/app-icon"
import { Money } from "@/components/common/money"
import { PartialDate } from "@/components/common/partial-date"
import { StatusBadge } from "@/components/common/status-badge"
import { t } from "@/lib/i18n/bn"
import { cn } from "@/lib/utils"
import { isPending } from "@/features/ledger/schema"
import type { GiftWithEvent } from "@/features/ledger/queries"

const ItemCell = ({ g }: { g: GiftWithEvent }) => (isPending(g) ? <StatusBadge tone="warning">{t.gift.pending}</StatusBadge> : g.item ? <>{g.item}</> : <span className="text-stone-400">—</span>)
const DirIcon = ({ g, size = 16 }: { g: GiftWithEvent; size?: 16 | 20 }) => <AppIcon name={g.direction === "received" ? "in" : "out"} size={size} className={g.direction === "received" ? "text-emerald-700" : "text-amber-700"} />

// তারিখ অনুযায়ী পুরো ইতিহাস — মোবাইল সারি, sm+ টেবিল
export function PersonHistory({ history, onRowClick }: { history: GiftWithEvent[]; onRowClick: (g: GiftWithEvent) => void }) {
  return (
    <div>
      <div className="divide-y divide-stone-100 sm:hidden">
        {history.map((g) => (
          <button key={g.id} type="button" onClick={() => onRowClick(g)} className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-stone-50">
            <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", g.direction === "received" ? "bg-emerald-100" : "bg-amber-100")}>
              <DirIcon g={g} size={20} />
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
          </button>
        ))}
      </div>
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t.event.date}</TableHead>
              <TableHead>{t.xlsx.event}</TableHead>
              <TableHead className="text-right">{t.gift.amount}</TableHead>
              <TableHead>{t.gift.item}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((g) => (
              <TableRow key={g.id} onClick={() => onRowClick(g)} className="cursor-pointer">
                <TableCell className="whitespace-nowrap text-stone-500"><PartialDate value={g.event.date} /></TableCell>
                <TableCell>
                  <span className="flex items-center gap-1.5">
                    <DirIcon g={g} />
                    <Link to="/events/$eventId" params={{ eventId: g.event.id }} className="font-medium hover:underline" onClick={(e) => e.stopPropagation()}>
                      {g.event.name}
                    </Link>
                  </span>
                </TableCell>
                <TableCell className="text-right"><Money value={g.amount} tone={g.direction} /></TableCell>
                <TableCell><ItemCell g={g} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

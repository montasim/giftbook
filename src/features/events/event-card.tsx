import { Link } from "@tanstack/react-router"
import { Card } from "@/components/ui/card"
import { AppIcon } from "@/components/common/app-icon"
import { Money } from "@/components/common/money"
import { PartialDate } from "@/components/common/partial-date"
import { StatusBadge } from "@/components/common/status-badge"
import { eventType } from "@/config/event-types"
import { t } from "@/lib/i18n"
import { digits } from "@/lib/format"
import type { LedgerEvent } from "@/features/ledger/schema"
import type { Totals } from "@/features/ledger/queries"

export function EventCard({ event, totals }: { event: LedgerEvent; totals: Totals }) {
  const type = eventType(event.type)
  return (
    <Link to="/events/$eventId" params={{ eventId: event.id }} className="flex rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none">
      <Card className="flex min-w-0 flex-1 flex-row gap-3 p-4 transition-colors hover:border-emerald-300">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800">
          <AppIcon name={type.icon} size={24} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{event.name}</p>
          <p className="truncate text-sm text-stone-500">
            {type.label} · <PartialDate value={event.date} />
            {event.location && ` · ${event.location}`}
          </p>
          {totals.count === 0 ? (
            <p className="mt-2 text-sm text-stone-400">{t.event.noGifts}</p>
          ) : (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
              <span className="flex items-center gap-1">
                <AppIcon name="in" size={16} className="text-emerald-700" />
                {t.event.received} <Money value={totals.received} tone="received" />
              </span>
              <span className="flex items-center gap-1">
                <AppIcon name="out" size={16} className="text-amber-700" />
                {t.event.given} <Money value={totals.given} tone="given" />
              </span>
              <span className="text-stone-400">{t.home.gifts(digits(totals.count))}</span>
              {totals.pending > 0 && <StatusBadge tone="warning">{t.home.pending(digits(totals.pending))}</StatusBadge>}
            </div>
          )}
        </div>
        <AppIcon name="chevronRight" size={16} className="self-center text-stone-400" />
      </Card>
    </Link>
  )
}

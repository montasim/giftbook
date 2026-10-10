import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AppIcon } from "@/components/common/app-icon"
import { EmptyState } from "@/components/common/empty-state"
import { Fab } from "@/components/common/fab"
import { Money } from "@/components/common/money"
import { PageHeader } from "@/components/common/page-header"
import { Stat } from "@/components/common/stat"
import { useLedger } from "@/components/common/ledger-context"
import { EventCard } from "@/features/events/event-card"
import { EventFormDialog } from "@/features/events/event-form"
import { selectAllTotals, selectEvents, totalsByEvent } from "@/features/ledger/queries"
import { t } from "@/lib/i18n"
import { digits } from "@/lib/format"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/_app/events/")({ component: HomePage })

function HomePage() {
  const { data } = useLedger()
  const events = selectEvents(data)
  const all = selectAllTotals(data)
  const totalsOf = totalsByEvent(data)
  const [open, setOpen] = useState(false)
  const newBtn = (cls?: string) => (
    <Button className={cls} onClick={() => setOpen(true)}>
      <AppIcon name="plus" />
      {t.home.newEvent}
    </Button>
  )
  return (
    <div>
      <PageHeader title={t.home.title} crumbs={[{ label: t.home.title }]} subtitle={events.length ? t.home.gifts(digits(all.count)) : null} actions={events.length > 0 && newBtn("hidden sm:inline-flex")} />
      {events.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:mb-6">
          <Stat label={`${t.home.allTime} · ${t.event.received}`} value={<Money value={all.received} tone="received" />} />
          <Stat label={`${t.home.allTime} · ${t.event.given}`} value={<Money value={all.given} tone="given" />} />
          <Stat label={t.event.net} value={<Money value={all.net} tone={all.net >= 0 ? "received" : "given"} />} />
          <Stat label={t.event.pendingTitle} value={<span className={cn("font-semibold", all.pending ? "text-amber-700" : "text-stone-400")}>{digits(all.pending)}</span>} />
        </div>
      )}
      {events.length === 0 ? (
        <EmptyState icon="gift" title={t.home.empty} description={t.home.emptyHint}>
          {newBtn()}
        </EmptyState>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {events.map((e) => (
            <EventCard key={e.id} event={e} totals={totalsOf(e.id)} />
          ))}
        </div>
      )}
      {events.length > 0 && <Fab label={t.home.newEvent} onClick={() => setOpen(true)} />}
      <EventFormDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}

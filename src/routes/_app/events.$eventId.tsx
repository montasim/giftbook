import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppIcon } from "@/components/common/app-icon"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { NotFound } from "@/components/common/not-found"
import { PageHeader } from "@/components/common/page-header"
import { useLedger } from "@/components/common/ledger-context"
import { EventFormDialog } from "@/features/events/event-form"
import { EventTotals } from "@/features/events/event-totals"
import { GiftFormDialog } from "@/features/gifts/gift-form"
import { DEFAULT_GIFT_SORT, GiftTable, sortGifts, type GiftSort, type GiftSortKey } from "@/features/gifts/gift-table"
import { PAGE_SIZE, Pagination } from "@/components/common/pagination"
import { QuickAddDialog } from "@/features/gifts/quick-add"
import { Fab } from "@/components/common/fab"
import { takeFocus } from "@/lib/focus"
import { exportEventXlsx } from "@/features/export/to-xlsx"
import { selectEvent, selectEventGifts, totals } from "@/features/ledger/queries"
import { isPending, type Gift } from "@/features/ledger/schema"
import { eventType } from "@/config/event-types"
import { t } from "@/lib/i18n"
import { formatPartialDate, digits } from "@/lib/format"

export const Route = createFileRoute("/_app/events/$eventId")({ component: EventPage })

type Tab = "all" | "received" | "given" | "pending"
let lastTab: Tab = "all" // re-render / ফিরে এলে ট্যাব থাকে

function EventPage() {
  const { eventId } = Route.useParams()
  const { data, repo } = useLedger()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>(lastTab)
  const [edit, setEdit] = useState(false)
  const [del, setDel] = useState(false)
  const [gift, setGift] = useState<Gift | null>(null)
  const [add, setAdd] = useState(() => takeFocus("quick-add")) // নতুন অনুষ্ঠান → সোজা উপহার যোগ মডাল
  const [sort, setSort] = useState<GiftSort>(DEFAULT_GIFT_SORT)
  const [page, setPage] = useState(1)
  const onSort = (key: GiftSortKey) => { setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : s.key === key ? "desc" : key === "amount" || key === "updatedAt" ? "desc" : "asc" })); setPage(1) }
  const event = selectEvent(data, eventId)
  if (!event) return <NotFound />
  const gifts = selectEventGifts(data, event.id)
  const sum = totals(gifts)
  const filters: Record<Tab, (g: Gift) => boolean> = { all: () => true, received: (g) => g.direction === "received", given: (g) => g.direction === "given", pending: isPending }
  const visible = sortGifts(gifts.filter(filters[tab]), sort)
  const safePage = Math.min(page, Math.max(1, Math.ceil(visible.length / PAGE_SIZE)))
  const paged = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const type = eventType(event.type)
  const count = (n: number) => <span className="ml-1 rounded-full bg-stone-200 px-1.5 text-xs text-stone-600">{digits(n)}</span>

  return (
    <div>
      <PageHeader
        title={event.name}
        crumbs={[{ label: t.home.title, to: "/events" }, { label: event.name }]}
        subtitle={[type.label, formatPartialDate(event.date), event.location].filter(Boolean).join(" · ")}
        actions={
          <>
          <Button className="hidden sm:inline-flex" onClick={() => setAdd(true)}>
            <AppIcon name="plus" />
            {t.gift.addTitle}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label={t.common.more}>
                <AppIcon name="more" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEdit(true)}><AppIcon name="edit" size={16} />{t.common.edit}</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => exportEventXlsx(event, gifts)}><AppIcon name="download" size={16} />{t.common.export}</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => void navigate({ to: "/events/$eventId/print", params: { eventId: event.id } })}><AppIcon name="print" size={16} />{t.common.print}</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => setDel(true)}><AppIcon name="trash" size={16} />{t.common.delete}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </>
        }
      />
      <div className="flex flex-col gap-4">
        <EventTotals totals={sum} />
        <div className="flex flex-col gap-4">
          <Tabs value={tab} onValueChange={(v) => { setTab(v as Tab); lastTab = v as Tab; setPage(1) }}>
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">{t.event.tabs.all}{count(gifts.length)}</TabsTrigger>
              <TabsTrigger value="received" className="flex-1">{t.event.tabs.received}</TabsTrigger>
              <TabsTrigger value="given" className="flex-1">{t.event.tabs.given}</TabsTrigger>
              <TabsTrigger value="pending" className="flex-1">{t.event.tabs.pending}{count(sum.pending)}</TabsTrigger>
            </TabsList>
          </Tabs>
          {gifts.length === 0 ? (
            <EmptyState icon="gift" title={t.event.noGifts} description={t.event.noGiftsHint} />
          ) : visible.length === 0 ? (
            <EmptyState icon="search" title={t.event.noMatch} />
          ) : (
            <>
              <Card className="overflow-hidden p-0">
                <GiftTable gifts={paged} onRowClick={setGift} sort={sort} onSort={onSort} />
              </Card>
              <Pagination page={safePage} total={visible.length} onChange={setPage} />
            </>
          )}
        </div>
      </div>
      <Fab label={t.gift.addTitle} onClick={() => setAdd(true)} />
      <QuickAddDialog open={add} onOpenChange={setAdd} eventId={event.id} />
      <EventFormDialog open={edit} onOpenChange={setEdit} event={event} />
      <GiftFormDialog gift={gift} onOpenChange={(o) => !o && setGift(null)} />
      <ConfirmDialog open={del} onOpenChange={setDel} title={t.event.deleteTitle} description={t.event.deleteDesc} confirmText={t.common.delete} onConfirm={async () => { await repo.removeEvent(event.id); toast(t.common.deleted); void navigate({ to: "/events", replace: true }) }} />
    </div>
  )
}

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
import { Money } from "@/components/common/money"
import { NotFound } from "@/components/common/not-found"
import { PageHeader } from "@/components/common/page-header"
import { PAGE_SIZE, Pagination } from "@/components/common/pagination"
import { Stat } from "@/components/common/stat"
import { useLedger } from "@/components/common/ledger-context"
import { GiftFormDialog } from "@/features/gifts/gift-form"
import { MergePersonDialog } from "@/features/people/merge-person-dialog"
import { PersonFormDialog } from "@/features/people/person-form"
import { DEFAULT_HISTORY_SORT, PersonHistory, sortHistory, type HistorySort, type HistorySortKey } from "@/features/people/person-history"
import { selectPerson, selectPersonHistory, totals } from "@/features/ledger/queries"
import { isPending, type Gift } from "@/features/ledger/schema"
import { t } from "@/lib/i18n"
import { formatPhone, digits } from "@/lib/format"

export const Route = createFileRoute("/_app/people/$personId")({ component: PersonPage })

type Tab = "all" | "received" | "given" | "pending"

// অনুষ্ঠান পাতার মতোই: উপরে সারাংশ, নিচে ট্যাব + সাজানো/পাতা-করা টেবিল
function PersonPage() {
  const { personId } = Route.useParams()
  const { data, repo } = useLedger()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>("all")
  const [edit, setEdit] = useState(false)
  const [merge, setMerge] = useState(false)
  const [del, setDel] = useState(false)
  const [gift, setGift] = useState<Gift | null>(null)
  const [sort, setSort] = useState<HistorySort>(DEFAULT_HISTORY_SORT)
  const [page, setPage] = useState(1)
  const onSort = (key: HistorySortKey) => { setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : s.key === key ? "desc" : key === "amount" || key === "date" ? "desc" : "asc" })); setPage(1) }
  const person = selectPerson(data, personId)
  if (!person) return <NotFound />
  const history = selectPersonHistory(data, person.id)
  const sum = totals(history)
  const filters: Record<Tab, (g: Gift) => boolean> = { all: () => true, received: (g) => g.direction === "received", given: (g) => g.direction === "given", pending: isPending }
  const visible = sortHistory(history.filter(filters[tab]), sort)
  const safePage = Math.min(page, Math.max(1, Math.ceil(visible.length / PAGE_SIZE)))
  const paged = visible.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const count = (n: number) => <span className="ml-1 rounded-full bg-stone-200 px-1.5 text-xs text-stone-600">{digits(n)}</span>

  return (
    <div>
      <PageHeader
        title={person.name}
        subtitle={[person.relation, person.phone && formatPhone(person.phone), person.address].filter(Boolean).join(" · ") || null}
        actions={
          <>
            <Button className="hidden sm:inline-flex" onClick={() => setEdit(true)}>
              <AppIcon name="edit" />
              {t.people.edit}
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label={t.common.more}>
                  <AppIcon name="more" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="sm:hidden" onSelect={() => setEdit(true)}><AppIcon name="edit" size={16} />{t.people.edit}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setMerge(true)}><AppIcon name="merge" size={16} />{t.people.merge}</DropdownMenuItem>
                <DropdownMenuItem variant="destructive" onSelect={() => setDel(true)}><AppIcon name="trash" size={16} />{t.common.delete}</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2">
          <Stat label={t.people.received} value={<Money value={sum.received} tone="received" />} />
          <Stat label={t.people.given} value={<Money value={sum.given} tone="given" />} />
          <Stat label={t.people.balance} value={<Money value={sum.net} tone={sum.net >= 0 ? "received" : "given"} />} />
        </div>
        {person.note && <p className="text-sm text-stone-500">{person.note}</p>}
        <Tabs value={tab} onValueChange={(v) => { setTab(v as Tab); setPage(1) }}>
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">{t.event.tabs.all}{count(history.length)}</TabsTrigger>
            <TabsTrigger value="received" className="flex-1">{t.event.tabs.received}</TabsTrigger>
            <TabsTrigger value="given" className="flex-1">{t.event.tabs.given}</TabsTrigger>
            <TabsTrigger value="pending" className="flex-1">{t.event.tabs.pending}{count(sum.pending)}</TabsTrigger>
          </TabsList>
        </Tabs>
        {history.length === 0 ? (
          <EmptyState icon="gift" title={t.people.noHistory} />
        ) : visible.length === 0 ? (
          <EmptyState icon="search" title={t.event.noMatch} />
        ) : (
          <>
            <Card className="overflow-hidden p-0">
              <PersonHistory history={paged} onRowClick={setGift} sort={sort} onSort={onSort} />
            </Card>
            <Pagination page={safePage} total={visible.length} onChange={setPage} />
          </>
        )}
      </div>
      <PersonFormDialog open={edit} onOpenChange={setEdit} person={person} />
      {merge && <MergePersonDialog open={merge} onOpenChange={setMerge} person={person} />}
      <GiftFormDialog gift={gift} onOpenChange={(o) => !o && setGift(null)} />
      <ConfirmDialog open={del} onOpenChange={setDel} title={t.people.deleteTitle} description={t.people.deleteDesc} confirmText={t.common.delete} onConfirm={async () => { await repo.removePerson(person.id); toast(t.common.deleted); void navigate({ to: "/people", replace: true }) }} />
    </div>
  )
}

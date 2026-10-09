import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AppIcon } from "@/components/common/app-icon"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { EmptyState } from "@/components/common/empty-state"
import { Money } from "@/components/common/money"
import { NotFound } from "@/components/common/not-found"
import { PageHeader } from "@/components/common/page-header"
import { Stat } from "@/components/common/stat"
import { useLedger } from "@/components/common/ledger-context"
import { GiftFormDialog } from "@/features/gifts/gift-form"
import { MergePersonDialog } from "@/features/people/merge-person-dialog"
import { PersonFormDialog } from "@/features/people/person-form"
import { PersonHistory } from "@/features/people/person-history"
import { selectPerson, selectPersonHistory, totals } from "@/features/ledger/queries"
import type { Gift } from "@/features/ledger/schema"
import { t } from "@/lib/i18n/bn"
import { formatPhone, toBanglaDigits } from "@/lib/format"

export const Route = createFileRoute("/_app/people/$personId")({ component: PersonPage })

// আসল জাদু: মোট পেলাম বনাম দিলাম, তারিখ অনুযায়ী পুরো ইতিহাস
function PersonPage() {
  const { personId } = Route.useParams()
  const { data, repo } = useLedger()
  const navigate = useNavigate()
  const [edit, setEdit] = useState(false)
  const [merge, setMerge] = useState(false)
  const [del, setDel] = useState(false)
  const [gift, setGift] = useState<Gift | null>(null)
  const person = selectPerson(data, personId)
  if (!person) return <NotFound />
  const history = selectPersonHistory(data, person.id)
  const sum = totals(history)
  return (
    <div>
      <PageHeader
        title={person.name}
        crumbs={[{ label: t.people.title, to: "/people" }, { label: person.name }]}
        subtitle={[person.relation, person.phone && formatPhone(person.phone), person.address].filter(Boolean).join(" · ") || null}
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" aria-label={t.common.more}>
                <AppIcon name="more" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setEdit(true)}><AppIcon name="edit" size={16} />{t.people.edit}</DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => setDel(true)}><AppIcon name="trash" size={16} />{t.common.delete}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[18rem_1fr] lg:items-start lg:gap-6">
        <div className="flex flex-col gap-4 lg:sticky lg:top-8">
          {person.note && <p className="text-sm text-stone-500">{person.note}</p>}
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
            <Stat label={t.people.received} value={<Money value={sum.received} tone="received" />} />
            <Stat label={t.people.given} value={<Money value={sum.given} tone="given" />} />
            <Stat label={t.people.balance} value={<Money value={sum.net} tone={sum.net >= 0 ? "received" : "given"} />} />
          </div>
          <Button variant="outline" className="self-start" onClick={() => setMerge(true)}>
            <AppIcon name="merge" />
            {t.people.merge}
          </Button>
        </div>
        <Card className="overflow-hidden p-0">
          <CardHeader className="flex flex-row items-center justify-between px-4 pt-4 pb-2">
            <CardTitle>{t.people.history}</CardTitle>
            <span className="text-xs text-stone-500">{t.people.count(toBanglaDigits(sum.count))}</span>
          </CardHeader>
          {history.length === 0 ? (
            <CardContent className="p-4">
              <EmptyState icon="gift" title={t.people.noHistory} />
            </CardContent>
          ) : (
            <PersonHistory history={history} onRowClick={setGift} />
          )}
        </Card>
      </div>
      <PersonFormDialog open={edit} onOpenChange={setEdit} person={person} />
      {merge && <MergePersonDialog open={merge} onOpenChange={setMerge} person={person} />}
      <GiftFormDialog gift={gift} onOpenChange={(o) => !o && setGift(null)} />
      <ConfirmDialog open={del} onOpenChange={setDel} title={t.people.deleteTitle} description={t.people.deleteDesc} confirmText={t.common.delete} onConfirm={async () => { await repo.removePerson(person.id); toast(t.common.deleted); void navigate({ to: "/people", replace: true }) }} />
    </div>
  )
}

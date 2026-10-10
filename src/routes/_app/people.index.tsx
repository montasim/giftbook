import { Link, createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AppIcon } from "@/components/common/app-icon"
import { AvatarInitial } from "@/components/common/avatar-initial"
import { EmptyState } from "@/components/common/empty-state"
import { Money } from "@/components/common/money"
import { PageHeader } from "@/components/common/page-header"
import { useLedger } from "@/components/common/ledger-context"
import { PersonFormDialog } from "@/features/people/person-form"
import { selectPeople, totalsByPerson } from "@/features/ledger/queries"
import { t } from "@/lib/i18n"
import { formatPhone, toAsciiDigits } from "@/lib/format"

export const Route = createFileRoute("/_app/people/")({ component: PeoplePage })

let lastQuery = ""

function PeoplePage() {
  const { data } = useLedger()
  const people = selectPeople(data)
  const totalsOf = totalsByPerson(data)
  const [query, setQuery] = useState(lastQuery)
  const [open, setOpen] = useState(false)
  const q = query.trim().toLowerCase()
  const qd = toAsciiDigits(q).replace(/\D/g, "")
  const rows = people.filter((p) => !q || p.name.toLowerCase().includes(q) || (qd && p.phone.includes(qd)))
  return (
    <div>
      <PageHeader
        title={t.people.title}
        crumbs={[{ label: t.people.title }]}
        actions={
          <Button variant="outline" onClick={() => setOpen(true)}>
            <AppIcon name="plus" />
            {t.people.add}
          </Button>
        }
      />
      {people.length === 0 ? (
        <EmptyState icon="people" title={t.people.empty} description={t.people.emptyHint} />
      ) : (
        <div className="flex flex-col gap-3">
          <div className="relative">
            <AppIcon name="search" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-stone-400" />
            <Input type="search" value={query} placeholder={t.people.searchPlaceholder} className="pl-10" onChange={(e) => { setQuery(e.target.value); lastQuery = e.target.value }} />
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {rows.length === 0 ? (
              <EmptyState icon="search" title={t.people.noResult} className="md:col-span-2" />
            ) : (
              rows.map((p) => {
                const s = totalsOf(p.id)
                return (
                  <Link key={p.id} to="/people/$personId" params={{ personId: p.id }} className="flex rounded-xl focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:outline-none">
                    <Card className="flex min-w-0 flex-1 flex-row items-center gap-3 p-3 hover:border-emerald-300">
                      <AvatarInitial name={p.name} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">{p.name}</p>
                        <p className="truncate text-xs text-stone-500">{[p.relation, p.phone && formatPhone(p.phone), p.address].filter(Boolean).join(" · ") || "—"}</p>
                      </div>
                      <div className="flex flex-col items-end text-xs text-stone-500">
                        <span className="flex items-center gap-1"><AppIcon name="in" size={12} className="text-emerald-700" /><Money value={s.received} tone="received" className="text-sm" /></span>
                        <span className="flex items-center gap-1"><AppIcon name="out" size={12} className="text-amber-700" /><Money value={s.given} tone="given" className="text-sm" /></span>
                      </div>
                      <AppIcon name="chevronRight" size={16} className="text-stone-400" />
                    </Card>
                  </Link>
                )
              })
            )}
          </div>
        </div>
      )}
      <PersonFormDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}

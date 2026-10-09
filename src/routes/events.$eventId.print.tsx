import { Link, createFileRoute, redirect } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AppIcon } from "@/components/common/app-icon"
import { LedgerGate } from "@/components/common/ledger-gate"
import { Money } from "@/components/common/money"
import { NotFound } from "@/components/common/not-found"
import { StatusBadge } from "@/components/common/status-badge"
import { getSession, setRedirect } from "@/features/auth/session"
import { selectEvent, selectEventGifts, totals, type LedgerData } from "@/features/ledger/queries"
import { isPending } from "@/features/ledger/schema"
import { eventType } from "@/config/event-types"
import { t } from "@/lib/i18n/bn"
import { formatPartialDate, toBanglaDigits } from "@/lib/format"

// খাতার মতো: সরল লাইন, বড় বাংলা ফন্ট; shell নেই
export const Route = createFileRoute("/events/$eventId/print")({
  beforeLoad: ({ location }) => {
    const s = getSession()
    if (!s.user) {
      setRedirect(location.href)
      throw redirect({ to: "/login" })
    }
    if (!s.fileId) throw redirect({ to: "/setup" })
  },
  component: () => <LedgerGate shell={false}>{(l) => <PrintPage data={l.data} />}</LedgerGate>,
})

function PrintPage({ data }: { data: LedgerData }) {
  const { eventId } = Route.useParams()
  const event = selectEvent(data, eventId)
  if (!event) return <NotFound />
  const gifts = [...selectEventGifts(data, event.id)].sort((a, b) => (a.person?.name ?? "").localeCompare(b.person?.name ?? "", "bn"))
  const sum = totals(gifts)
  const th = "text-base text-stone-900"
  return (
    <div className="mx-auto max-w-3xl bg-white p-6 print:p-0">
      <div className="mb-4 flex items-center justify-between gap-2 print:hidden">
        <Link to="/events/$eventId" params={{ eventId: event.id }} className="flex items-center gap-1 text-sm text-stone-600">
          <AppIcon name="back" />
          {t.common.back}
        </Link>
        <Button onClick={() => window.print()}>
          <AppIcon name="print" />
          {t.common.print}
        </Button>
      </div>
      <div className="mb-4 border-b-2 border-stone-900 pb-3">
        <h1 className="text-2xl font-bold">{event.name}</h1>
        <p className="text-stone-600">{[eventType(event.type).label, formatPartialDate(event.date), event.location].filter(Boolean).join(" · ")}</p>
      </div>
      <Table className="text-base">
        <TableHeader>
          <TableRow>
            <TableHead className={`w-10 ${th}`}>{t.print.serial}</TableHead>
            <TableHead className={th}>{t.xlsx.name}</TableHead>
            <TableHead className={th}>{t.xlsx.direction}</TableHead>
            <TableHead className={`text-right ${th}`}>{t.xlsx.amount}</TableHead>
            <TableHead className={th}>{t.xlsx.item}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {gifts.map((g, i) => (
            <TableRow key={g.id} className="border-stone-300">
              <TableCell className="text-stone-500">{toBanglaDigits(i + 1)}</TableCell>
              <TableCell className="font-medium">
                {g.person?.name ?? ""}
                {g.person?.relation && <span className="text-sm text-stone-500"> ({g.person.relation})</span>}
              </TableCell>
              <TableCell>{g.direction === "received" ? t.event.received : t.event.given}</TableCell>
              <TableCell className="text-right"><Money value={g.amount} /></TableCell>
              <TableCell>{isPending(g) ? <StatusBadge tone="warning">{t.gift.pending}</StatusBadge> : g.item}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={3}>{t.print.total} — {t.event.received}</TableCell>
            <TableCell className="text-right"><Money value={sum.received} /></TableCell>
            <TableCell />
          </TableRow>
          <TableRow>
            <TableCell colSpan={3}>{t.print.total} — {t.event.given}</TableCell>
            <TableCell className="text-right"><Money value={sum.given} /></TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
      <p className="mt-6 text-center text-xs text-stone-400">{t.print.footer}</p>
    </div>
  )
}

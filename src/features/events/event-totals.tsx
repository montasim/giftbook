import { Stat } from "@/components/common/stat"
import { Money } from "@/components/common/money"
import { t } from "@/lib/i18n"
import { toBanglaDigits } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Totals } from "@/features/ledger/queries"

export const EventTotals = ({ totals }: { totals: Totals }) => (
  <div className="grid grid-cols-3 gap-2">
    <Stat label={t.event.received} value={<Money value={totals.received} tone="received" />} />
    <Stat label={t.event.given} value={<Money value={totals.given} tone="given" />} />
    <Stat label={t.event.pendingTitle} value={<span className={cn("font-semibold", totals.pending ? "text-amber-700" : "text-stone-400")}>{toBanglaDigits(totals.pending)}</span>} />
  </div>
)

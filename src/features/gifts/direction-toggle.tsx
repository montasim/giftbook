import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { AppIcon } from "@/components/common/app-icon"
import { t } from "@/lib/i18n/bn"
import { cn } from "@/lib/utils"
import type { Direction } from "@/features/ledger/schema"

export function DirectionToggle({ value, onChange, className }: { value: Direction; onChange: (d: Direction) => void; className?: string }) {
  return (
    <ToggleGroup type="single" value={value} onValueChange={(v) => v && onChange(v as Direction)} spacing={0} className={cn("rounded-lg bg-stone-100 p-1", className)}>
      <ToggleGroupItem value="received" className="h-8 flex-1 gap-1.5 rounded-md px-3 text-sm text-stone-500 data-[state=on]:bg-white data-[state=on]:text-emerald-700 data-[state=on]:shadow-sm">
        <AppIcon name="in" size={16} />
        {t.event.received}
      </ToggleGroupItem>
      <ToggleGroupItem value="given" className="h-8 flex-1 gap-1.5 rounded-md px-3 text-sm text-stone-500 data-[state=on]:bg-white data-[state=on]:text-amber-700 data-[state=on]:shadow-sm">
        <AppIcon name="out" size={16} />
        {t.event.given}
      </ToggleGroupItem>
    </ToggleGroup>
  )
}

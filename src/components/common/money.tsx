import { formatTaka } from "@/lib/format"
import { cn } from "@/lib/utils"

const tones = { default: "text-stone-900", received: "text-emerald-700", given: "text-amber-700", muted: "text-stone-400" }
export function Money({ value, tone = "default", className }: { value: number | null | undefined; tone?: keyof typeof tones; className?: string }) {
  return <span className={cn("font-semibold tabular-nums", tones[tone], className)}>{value == null ? "—" : formatTaka(value)}</span>
}

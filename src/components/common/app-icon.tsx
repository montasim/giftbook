import { HugeiconsIcon } from "@hugeicons/react"
import { icons, type IconName } from "@/config/icons"
import { cn } from "@/lib/utils"

// আইকন স্কেল: 12 · 16 · 20 · 24 · 32
export function AppIcon({ name, size = 20, className, strokeWidth = 1.75 }: { name: IconName; size?: 12 | 16 | 20 | 24 | 32; className?: string; strokeWidth?: number }) {
  return <HugeiconsIcon icon={icons[name]} size={size} strokeWidth={strokeWidth} className={cn("shrink-0", className)} aria-hidden />
}

import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const tones = { success: "bg-emerald-100 text-emerald-800", warning: "bg-amber-100 text-amber-800", neutral: "bg-stone-100 text-stone-700", dark: "bg-stone-900 text-white" }
export const StatusBadge = ({ tone = "neutral", className, children }: { tone?: keyof typeof tones; className?: string; children: ReactNode }) => (
  <Badge variant="secondary" className={cn("gap-1 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", tones[tone], className)}>
    {children}
  </Badge>
)

import type { ReactNode } from "react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export const Stat = ({ label, value, className }: { label: string; value: ReactNode; className?: string }) => (
  <Card className={cn("flex flex-col gap-0.5 p-3", className)}>
    <span className="text-xs text-stone-500">{label}</span>
    <span className="text-lg leading-tight">{value}</span>
  </Card>
)

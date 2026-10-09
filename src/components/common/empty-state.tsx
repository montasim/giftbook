import type { ReactNode } from "react"
import { AppIcon } from "./app-icon"
import type { IconName } from "@/config/icons"
import { cn } from "@/lib/utils"

export function EmptyState({ icon = "inbox", title, description, children, className }: { icon?: IconName; title: string; description?: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-stone-300 px-6 py-10 text-center", className)}>
      <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 text-stone-500">
        <AppIcon name={icon} size={24} />
      </span>
      <p className="font-semibold">{title}</p>
      {description && <p className="max-w-xs text-sm text-stone-500">{description}</p>}
      {children && <div className="mt-3 flex flex-wrap justify-center gap-2">{children}</div>}
    </div>
  )
}

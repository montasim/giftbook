import type { ReactNode } from "react"
import type { Crumb } from "./breadcrumbs"
import { cn } from "@/lib/utils"

// শিরোনাম (আইকন/breadcrumb নেই) + ডানে অ্যাকশন। crumbs এখন ব্যবহার হয় না — চাইলে ফেরানো যায়।
export function PageHeader({ title, subtitle, crumbs, actions, className }: { title: string; subtitle?: string | null; crumbs?: Crumb[]; actions?: ReactNode; className?: string }) {
  void crumbs
  return (
    <div className={cn("mb-4 lg:mb-6", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-lg leading-tight font-bold sm:text-xl lg:text-2xl">{title}</h1>
          {subtitle && <p className="mt-0.5 line-clamp-2 text-sm text-stone-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

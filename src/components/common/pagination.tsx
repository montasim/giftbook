import { Button } from "@/components/ui/button"
import { AppIcon } from "./app-icon"
import { t } from "@/lib/i18n"
import { toBanglaDigits } from "@/lib/format"
import { cn } from "@/lib/utils"

export const PAGE_SIZE = 20

// "১–২০ / ৫৬" · ‹ ১ ২ … ৩ ›
export function Pagination({ page, total, pageSize = PAGE_SIZE, onChange, className }: { page: number; total: number; pageSize?: number; onChange: (p: number) => void; className?: string }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  if (pages <= 1) return null
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1)
  const items: (number | "…")[] = []
  nums.forEach((n, i) => {
    if (i > 0 && n - (nums[i - 1] ?? 0) > 1) items.push("…")
    items.push(n)
  })
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-2", className)}>
      <p className="text-sm text-stone-500">{t.common.pageRange(toBanglaDigits(from), toBanglaDigits(to), toBanglaDigits(total))}</p>
      <nav className="flex items-center gap-1" aria-label={t.common.pagination}>
        <Button variant="outline" size="icon-xs" aria-label={t.common.prev} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          <AppIcon name="back" size={16} />
        </Button>
        {items.map((it, i) =>
          it === "…" ? (
            <span key={`e${i}`} className="px-1 text-stone-400">…</span>
          ) : (
            <Button key={it} variant={it === page ? "default" : "outline"} size="icon-xs" aria-current={it === page ? "page" : undefined} onClick={() => onChange(it)}>
              {toBanglaDigits(it)}
            </Button>
          )
        )}
        <Button variant="outline" size="icon-xs" aria-label={t.common.next} disabled={page >= pages} onClick={() => onChange(page + 1)}>
          <AppIcon name="chevronRight" size={16} />
        </Button>
      </nav>
    </div>
  )
}

import type { ReactNode } from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

// Label + control + hint + error (বাংলা, ফিল্ডের নিচে)
export function Field({ label, hint, error, htmlFor, children, className }: { label?: string; hint?: string; error?: string | null; htmlFor?: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {hint && <p className="text-xs text-stone-500">{hint}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}

// TanStack Form / Zod এরর → একটা বাংলা লাইন
export const firstError = (errors: unknown[] | undefined): string | null => {
  const e = errors?.find(Boolean)
  if (!e) return null
  return typeof e === "string" ? e : ((e as { message?: string }).message ?? null)
}

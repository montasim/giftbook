import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { initials } from "@/lib/format"
import { cn } from "@/lib/utils"

const palette = ["bg-emerald-200 text-emerald-900", "bg-amber-200 text-amber-900", "bg-sky-200 text-sky-900", "bg-rose-200 text-rose-900", "bg-violet-200 text-violet-900"]
// নামের hash → ৫ রঙের প্যালেট
export function AvatarInitial({ name, size = "md", className }: { name: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const idx = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length
  return (
    <Avatar className={cn(size === "sm" ? "size-8" : size === "lg" ? "size-14" : "size-10", className)}>
      <AvatarFallback className={cn("font-semibold", size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base", palette[idx])}>{initials(name)}</AvatarFallback>
    </Avatar>
  )
}

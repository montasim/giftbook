import { useEffect, useImperativeHandle, useRef, useState, type Ref } from "react"
import { Input } from "@/components/ui/input"
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover"
import { AppIcon } from "@/components/common/app-icon"
import { t } from "@/lib/i18n/bn"
import { formatPhone, toAsciiDigits } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { Person } from "@/features/ledger/schema"

export type PersonChoice = { personId: string | null; name: string }
export type PersonComboboxHandle = { focus: () => void }
type Item = { type: "person"; person: Person } | { type: "new"; name: string }

// নাম/ফোন খোঁজ · "নতুন: X" · ↑↓ Enter Esc · Portal (ডায়ালগে ক্লিপ হয় না)
export function PersonCombobox({ people, value, onChange, onPick, excludeId, allowNew = true, placeholder, id, invalid, autoFocus, ref }: {
  people: Person[]; value: PersonChoice; onChange: (v: PersonChoice) => void; onPick?: () => void; excludeId?: string; allowNew?: boolean; placeholder?: string; id?: string; invalid?: boolean; autoFocus?: boolean; ref?: Ref<PersonComboboxHandle>
}) {
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  useImperativeHandle(ref, () => ({ focus: () => inputRef.current?.focus() }), [])

  const q = value.name.trim().toLowerCase()
  const qd = toAsciiDigits(q).replace(/\D/g, "")
  const matches = people.filter((p) => p.id !== excludeId && (!q || p.name.toLowerCase().includes(q) || (qd.length > 2 && p.phone.includes(qd)))).slice(0, 8)
  const items: Item[] = matches.map((p) => ({ type: "person", person: p }))
  if (allowNew && q && !matches.some((p) => p.name.toLowerCase() === q)) items.push({ type: "new", name: value.name.trim() })
  useEffect(() => setHi((h) => Math.min(h, Math.max(items.length - 1, 0))), [items.length])

  const pick = (it: Item) => {
    onChange(it.type === "person" ? { personId: it.person.id, name: it.person.name } : { personId: null, name: it.name })
    setOpen(false)
    onPick?.()
  }
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <Input
          ref={inputRef}
          id={id}
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          autoComplete="off"
          autoFocus={autoFocus}
          placeholder={placeholder}
          value={value.name}
          onChange={(e) => { onChange({ personId: null, name: e.target.value }); setHi(0); setOpen(true) }}
          onFocus={() => { if (!value.personId) setOpen(true) }} // আগে বাছা থাকলে ফর্ম ঢেকে দেয় না
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) return setOpen(true)
            if (e.key === "ArrowDown") { e.preventDefault(); setHi((h) => Math.min(h + 1, items.length - 1)) }
            else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, 0)) }
            else if (e.key === "Escape") setOpen(false)
            else if (e.key === "Enter" && open && items[hi]) { e.preventDefault(); pick(items[hi]) }
          }}
        />
      </PopoverAnchor>
      <PopoverContent align="start" onOpenAutoFocus={(e) => e.preventDefault()} onCloseAutoFocus={(e) => e.preventDefault()} className="max-h-64 w-[var(--radix-popover-trigger-width)] min-w-[16rem] overflow-y-auto bg-white p-1" role="listbox">
        {items.length === 0 ? (
          <p className="px-3 py-2 text-sm text-stone-400">{t.gift.noMatch}</p>
        ) : (
          items.map((it, i) => (
            <button
              key={it.type === "person" ? it.person.id : "new"}
              type="button"
              role="option"
              aria-selected={i === hi}
              onMouseDown={(e) => { e.preventDefault(); pick(it) }}
              onMouseEnter={() => setHi(i)}
              className={cn("flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm", i === hi ? "bg-emerald-50 text-emerald-900" : "hover:bg-stone-100")}
            >
              {it.type === "new" ? (
                <>
                  <AppIcon name="plus" size={16} />
                  <span className="font-medium">{t.gift.newPerson(it.name)}</span>
                </>
              ) : (
                <>
                  <AppIcon name="user" size={16} className="text-stone-400" />
                  <span>{it.person.name}</span>
                  {it.person.phone && <span className="ml-auto text-xs text-stone-400">{formatPhone(it.person.phone)}</span>}
                  {it.person.relation && <span className="text-xs text-stone-400">{it.person.relation}</span>}
                </>
              )}
            </button>
          ))
        )}
      </PopoverContent>
    </Popover>
  )
}

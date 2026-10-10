import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/common/field"
import { ResponsiveDialog } from "@/components/common/responsive-dialog"
import { useLedger } from "@/components/common/ledger-context"
import { PersonCombobox, type PersonChoice, type PersonComboboxHandle } from "@/features/people/person-combobox"
import { DirectionToggle } from "./direction-toggle"
import { findByPhone, selectPeople } from "@/features/ledger/queries"
import { emptyPerson, type Direction } from "@/features/ledger/schema"
import { t } from "@/lib/i18n"
import { normalizePhone, parseAmount } from "@/lib/format"

let lastDirection: Direction = "received" // পরপর যোগে দিক মনে থাকে

export function QuickAddDialog({ open, onOpenChange, eventId }: { open: boolean; onOpenChange: (o: boolean) => void; eventId: string }) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={t.gift.addTitle} description={t.gift.addHint}>
      {open && <QuickAddForm eventId={eventId} onClose={() => onOpenChange(false)} />}
    </ResponsiveDialog>
  )
}

// নাম * → ফোন (ঐচ্ছিক) → পেলাম/দিলাম → টাকা | জিনিস → নোট। সেভের পর ফর্ম খালি, ফোকাস নামে — মডাল খোলা থাকে।
function QuickAddForm({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const { data, repo } = useLedger()
  const people = selectPeople(data)
  const [direction, setDirection] = useState<Direction>(lastDirection)
  const [sel, setSel] = useState<PersonChoice>({ personId: null, name: "" })
  const [phone, setPhone] = useState("")
  const [amount, setAmount] = useState("")
  const [item, setItem] = useState("")
  const [note, setNote] = useState("")
  const [err, setErr] = useState(false)
  const [count, setCount] = useState(0)
  const combo = useRef<PersonComboboxHandle>(null)
  const amountRef = useRef<HTMLInputElement>(null)
  useEffect(() => { const id = setTimeout(() => combo.current?.focus(), 50); return () => clearTimeout(id) }, [count])

  const phoneOwner = findByPhone(data, normalizePhone(phone), sel.personId ?? undefined)
  const onPhone = (v: string) => {
    setPhone(v)
    const owner = findByPhone(data, normalizePhone(v))
    if (owner && !sel.personId) { setSel({ personId: owner.id, name: owner.name }); setErr(false) } // ফোন মিললে তাকেই বাছা
  }
  const submit = async () => {
    if (!sel.name) { setErr(true); combo.current?.focus(); return }
    const ph = normalizePhone(phone)
    let personId = sel.personId
    if (!personId) {
      const exact = people.find((p) => p.name.toLowerCase() === sel.name.toLowerCase())
      personId = exact ? exact.id : (await repo.addPerson({ ...emptyPerson(), name: sel.name, phone: ph })).id
      if (exact && ph && !exact.phone) await repo.updatePerson(exact.id, { phone: ph })
    } else {
      const existing = people.find((p) => p.id === personId)
      if (existing && ph && !existing.phone) await repo.updatePerson(personId, { phone: ph })
    }
    await repo.addGift({ eventId, personId, direction, amount: parseAmount(amount), item: item.trim(), note: note.trim() })
    toast(t.gift.added)
    setSel({ personId: null, name: "" }); setPhone(""); setAmount(""); setItem(""); setNote(""); setErr(false)
    setCount((c) => c + 1)
  }
  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); void submit() }}>
      <Field label={t.gift.direction}>
        <DirectionToggle value={direction} onChange={(d) => { setDirection(d); lastDirection = d }} className="w-full" />
      </Field>
      <Field label={`${t.people.name} *`} error={err ? t.gift.personRequired : null}>
        <PersonCombobox ref={combo} people={people} value={sel} onChange={(v) => { setSel(v); setErr(false) }} onPick={() => amountRef.current?.focus()} placeholder={t.people.namePlaceholder} invalid={err} />
      </Field>
      <Field label={`${t.people.phone} ${t.common.optional}`} error={phoneOwner ? t.people.duplicatePhone(phoneOwner.name) : null} htmlFor="qa-phone">
        <Input id="qa-phone" type="tel" inputMode="tel" placeholder={t.people.phonePlaceholder} value={phone} onChange={(e) => onPhone(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t.gift.amount} htmlFor="qa-amount">
          <Input id="qa-amount" ref={amountRef} inputMode="numeric" placeholder={t.gift.amountPlaceholder} value={amount} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label={t.gift.item} htmlFor="qa-item">
          <Input id="qa-item" placeholder={t.gift.itemPlaceholder} value={item} onChange={(e) => setItem(e.target.value)} />
        </Field>
      </div>
      <p className="text-xs text-stone-500">{t.gift.pendingHint}</p>
      <Field label={`${t.gift.note} ${t.common.optional}`} htmlFor="qa-note">
        <Input id="qa-note" placeholder={t.common.notePlaceholder} value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          {t.common.close}
        </Button>
        <Button type="submit" className="flex-1">
          {t.gift.add}
        </Button>
      </div>
    </form>
  )
}

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field } from "@/components/common/field"
import { ResponsiveDialog } from "@/components/common/responsive-dialog"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { useLedger } from "@/components/common/ledger-context"
import { PersonCombobox, type PersonChoice } from "@/features/people/person-combobox"
import { DirectionToggle } from "./direction-toggle"
import { selectPeople } from "@/features/ledger/queries"
import { emptyPerson, type Direction, type Gift } from "@/features/ledger/schema"
import { t } from "@/lib/i18n/bn"
import { normalizePhone, parseAmount, toBanglaDigits } from "@/lib/format"

export function GiftFormDialog({ gift, onOpenChange }: { gift: Gift | null; onOpenChange: (o: boolean) => void }) {
  return (
    <ResponsiveDialog open={gift !== null} onOpenChange={onOpenChange} title={t.gift.edit}>
      {gift && <GiftForm gift={gift} onDone={() => onOpenChange(false)} />}
    </ResponsiveDialog>
  )
}

function GiftForm({ gift, onDone }: { gift: Gift; onDone: () => void }) {
  const { data, repo } = useLedger()
  const people = selectPeople(data)
  const person = people.find((p) => p.id === gift.personId)
  const [sel, setSel] = useState<PersonChoice>({ personId: gift.personId, name: person?.name ?? "" })
  const [phone, setPhone] = useState(person?.phone ?? "")
  const [direction, setDirection] = useState<Direction>(gift.direction)
  const [amount, setAmount] = useState(gift.amount == null ? "" : toBanglaDigits(gift.amount))
  const [item, setItem] = useState(gift.item)
  const [note, setNote] = useState(gift.note)
  const [err, setErr] = useState<string | null>(null)
  const [confirm, setConfirm] = useState(false)

  const save = async () => {
    if (!sel.name) return setErr(t.gift.personRequired)
    const ph = normalizePhone(phone)
    const personId = sel.personId ?? (await repo.addPerson({ ...emptyPerson(), name: sel.name, phone: ph })).id
    const target = people.find((p) => p.id === personId)
    if (target && ph && target.phone !== ph) await repo.updatePerson(personId, { phone: ph })
    await repo.updateGift(gift.id, { personId, direction, amount: parseAmount(amount), item: item.trim(), note: note.trim() })
    toast(t.common.saved)
    onDone()
  }
  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); void save() }}>
      <div className="flex flex-col gap-4">
        <Field label={t.gift.person} error={err}>
          <PersonCombobox people={people} value={sel} onChange={(v) => { setSel(v); setErr(null); setPhone(people.find((p) => p.id === v.personId)?.phone ?? "") }} invalid={!!err} placeholder={`${t.people.name} *`} />
        </Field>
        <Field label={`${t.people.phone} ${t.common.optional}`} htmlFor="g-phone">
          <Input id="g-phone" type="tel" inputMode="tel" value={phone} placeholder={t.people.phonePlaceholder} onChange={(e) => setPhone(e.target.value)} />
        </Field>
      </div>
      <Field label={t.gift.direction}>
        <DirectionToggle value={direction} onChange={setDirection} className="w-full" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t.gift.amount} htmlFor="g-amount">
          <Input id="g-amount" inputMode="numeric" value={amount} placeholder={t.gift.amountPlaceholder} onChange={(e) => setAmount(e.target.value)} />
        </Field>
        <Field label={t.gift.item} htmlFor="g-item">
          <Input id="g-item" value={item} placeholder={t.gift.itemPlaceholder} onChange={(e) => setItem(e.target.value)} />
        </Field>
      </div>
      <p className="text-xs text-stone-500">{t.gift.pendingHint}</p>
      <Field label={`${t.gift.note} ${t.common.optional}`} htmlFor="g-note">
        <Textarea id="g-note" rows={2} value={note} placeholder={t.common.notePlaceholder} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="text-red-600" onClick={() => setConfirm(true)}>
          {t.common.delete}
        </Button>
        <Button type="submit" className="flex-1">
          {t.common.save}
        </Button>
      </div>
      <ConfirmDialog open={confirm} onOpenChange={setConfirm} title={t.gift.deleteTitle} confirmText={t.common.delete} onConfirm={async () => { await repo.removeGift(gift.id); toast(t.common.deleted); onDone() }} />
    </form>
  )
}

import { useForm } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, firstError } from "@/components/common/field"
import { ResponsiveDialog } from "@/components/common/responsive-dialog"
import { useLedger } from "@/components/common/ledger-context"
import { findByPhone } from "@/features/ledger/queries"
import { emptyPerson, personInputSchema, type Person } from "@/features/ledger/schema"
import { t } from "@/lib/i18n"
import { normalizePhone } from "@/lib/format"

export function PersonFormDialog({ open, onOpenChange, person }: { open: boolean; onOpenChange: (o: boolean) => void; person?: Person }) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={person ? t.people.edit : t.people.add}>
      {open && <PersonForm person={person} onDone={() => onOpenChange(false)} />}
    </ResponsiveDialog>
  )
}

function PersonForm({ person, onDone }: { person?: Person; onDone: () => void }) {
  const { data, repo } = useLedger()
  const navigate = useNavigate()
  const form = useForm({
    defaultValues: person ? { name: person.name, phone: person.phone, address: person.address, relation: person.relation, note: person.note } : emptyPerson(),
    validators: { onSubmit: personInputSchema },
    onSubmit: async ({ value }) => {
      const d = { name: value.name.trim(), phone: normalizePhone(value.phone), address: value.address.trim(), relation: value.relation.trim(), note: value.note.trim() }
      if (person) {
        await repo.updatePerson(person.id, d)
        toast(t.common.saved)
        onDone()
      } else {
        const row = await repo.addPerson(d)
        toast(t.common.saved)
        onDone()
        void navigate({ to: "/people/$personId", params: { personId: row.id } })
      }
    },
  })
  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); void form.handleSubmit() }}>
      <form.Field name="name">
        {(f) => (
          <Field label={t.people.name} error={firstError(f.state.meta.errors)} htmlFor="p-name">
            <Input id="p-name" autoFocus value={f.state.value} placeholder={t.people.namePlaceholder} aria-invalid={f.state.meta.errors.length > 0} onChange={(e) => f.handleChange(e.target.value)} />
          </Field>
        )}
      </form.Field>
      <form.Field name="phone">
        {(f) => {
          const dup = findByPhone(data, normalizePhone(f.state.value), person?.id) // একই ফোন আগে থাকলে সতর্ক করে, আটকায় না
          return (
            <Field label={`${t.people.phone} ${t.common.optional}`} error={dup ? t.people.duplicatePhone(dup.name) : null} htmlFor="p-phone">
              <Input id="p-phone" type="tel" inputMode="tel" value={f.state.value} placeholder={t.people.phonePlaceholder} onChange={(e) => f.handleChange(e.target.value)} />
            </Field>
          )
        }}
      </form.Field>
      <form.Field name="relation">
        {(f) => (
          <Field label={`${t.people.relation} ${t.common.optional}`} htmlFor="p-rel">
            <Input id="p-rel" value={f.state.value} placeholder={t.people.relationPlaceholder} onChange={(e) => f.handleChange(e.target.value)} />
          </Field>
        )}
      </form.Field>
      <form.Field name="address">
        {(f) => (
          <Field label={`${t.people.address} ${t.common.optional}`} htmlFor="p-addr">
            <Input id="p-addr" value={f.state.value} placeholder={t.people.addressPlaceholder} onChange={(e) => f.handleChange(e.target.value)} />
          </Field>
        )}
      </form.Field>
      <form.Field name="note">
        {(f) => (
          <Field label={`${t.people.note} ${t.common.optional}`} htmlFor="p-note">
            <Textarea id="p-note" rows={2} value={f.state.value} placeholder={t.common.notePlaceholder} onChange={(e) => f.handleChange(e.target.value)} />
          </Field>
        )}
      </form.Field>
      <Button type="submit" size="lg" className="mt-1">
        {t.common.save}
      </Button>
    </form>
  )
}

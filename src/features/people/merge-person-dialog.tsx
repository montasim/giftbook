import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/common/field"
import { ResponsiveDialog } from "@/components/common/responsive-dialog"
import { useLedger } from "@/components/common/ledger-context"
import { PersonCombobox, type PersonChoice } from "./person-combobox"
import { selectPeople } from "@/features/ledger/queries"
import type { Person } from "@/features/ledger/schema"
import { t } from "@/lib/i18n/bn"

export function MergePersonDialog({ open, onOpenChange, person }: { open: boolean; onOpenChange: (o: boolean) => void; person: Person }) {
  const { data, repo } = useLedger()
  const [sel, setSel] = useState<PersonChoice>({ personId: null, name: "" })
  const [err, setErr] = useState<string | null>(null)
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={t.people.mergeTitle} description={t.people.mergeDesc(person.name)}>
      <form
        noValidate
        className="flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault()
          if (!sel.personId) return setErr(t.people.mergeNeedExisting)
          await repo.mergePeople(person.id, sel.personId)
          toast(t.people.merged)
          onOpenChange(false)
        }}
      >
        <Field label={t.people.mergePick} error={err}>
          <PersonCombobox people={selectPeople(data)} value={sel} onChange={(v) => { setSel(v); setErr(null) }} excludeId={person.id} allowNew={false} placeholder={t.event.personPlaceholder} autoFocus />
        </Field>
        <Button type="submit" size="lg">
          {t.people.merge}
        </Button>
      </form>
    </ResponsiveDialog>
  )
}

import { useForm } from "@tanstack/react-form"
import { useNavigate } from "@tanstack/react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Field, firstError } from "@/components/common/field"
import { ResponsiveDialog } from "@/components/common/responsive-dialog"
import { DateControl } from "./date-control"
import { EVENT_TYPES, EVENT_TYPE_KEYS, type EventType } from "@/config/event-types"
import { t } from "@/lib/i18n"
import { requestFocus } from "@/lib/focus"
import { emptyEvent, eventInputSchema, type LedgerEvent } from "@/features/ledger/schema"
import { useLedger } from "@/components/common/ledger-context"

export function EventFormDialog({ open, onOpenChange, event }: { open: boolean; onOpenChange: (o: boolean) => void; event?: LedgerEvent }) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={event ? t.event.edit : t.event.create}>
      {open && <EventForm event={event} onDone={() => onOpenChange(false)} />}
    </ResponsiveDialog>
  )
}

function EventForm({ event, onDone }: { event?: LedgerEvent; onDone: () => void }) {
  const { repo } = useLedger()
  const navigate = useNavigate()
  const form = useForm({
    defaultValues: event ? { name: event.name, type: event.type, date: event.date, location: event.location, note: event.note } : emptyEvent(),
    validators: { onSubmit: eventInputSchema },
    onSubmit: async ({ value }) => {
      const data = { ...value, name: value.name.trim(), location: value.location.trim(), note: value.note.trim() }
      if (event) {
        await repo.updateEvent(event.id, data)
        toast(t.common.saved)
        onDone()
      } else {
        const row = await repo.addEvent(data)
        toast(t.common.saved)
        onDone()
        requestFocus("quick-add") // নতুন অনুষ্ঠান → সোজা নাম লেখার ঘরে
        void navigate({ to: "/events/$eventId", params: { eventId: row.id } })
      }
    },
  })
  return (
    <form noValidate className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); void form.handleSubmit() }}>
      <form.Field name="name">
        {(f) => (
          <Field label={t.event.name} error={firstError(f.state.meta.errors)} htmlFor="ev-name">
            <Input id="ev-name" autoFocus value={f.state.value} placeholder={t.event.namePlaceholder} aria-invalid={f.state.meta.errors.length > 0} onChange={(e) => f.handleChange(e.target.value)} onBlur={f.handleBlur} />
          </Field>
        )}
      </form.Field>
      <form.Field name="type">
        {(f) => (
          <Field label={t.event.type} error={firstError(f.state.meta.errors)}>
            <Select value={f.state.value} onValueChange={(v) => f.handleChange(v as EventType)}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPE_KEYS.map((k) => (
                  <SelectItem key={k} value={k}>
                    {EVENT_TYPES[k].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        )}
      </form.Field>
      <form.Field name="date">
        {(f) => (
          <Field label={t.event.date} error={firstError(f.state.meta.errors)}>
            <DateControl value={f.state.value} onChange={f.handleChange} />
          </Field>
        )}
      </form.Field>
      <form.Field name="location">
        {(f) => (
          <Field label={`${t.event.location} ${t.common.optional}`} htmlFor="ev-loc">
            <Input id="ev-loc" value={f.state.value} placeholder={t.event.locationPlaceholder} onChange={(e) => f.handleChange(e.target.value)} />
          </Field>
        )}
      </form.Field>
      <form.Field name="note">
        {(f) => (
          <Field label={`${t.event.note} ${t.common.optional}`} htmlFor="ev-note">
            <Textarea id="ev-note" rows={2} value={f.state.value} placeholder={t.common.notePlaceholder} onChange={(e) => f.handleChange(e.target.value)} />
          </Field>
        )}
      </form.Field>
      <Button type="submit" size="lg" className="mt-1">
        {t.common.save}
      </Button>
    </form>
  )
}

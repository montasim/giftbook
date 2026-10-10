import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Field } from "@/components/common/field"
import { AppIcon } from "@/components/common/app-icon"
import { AvatarInitial } from "@/components/common/avatar-initial"
import { EmptyState } from "@/components/common/empty-state"
import { ResponsiveDialog } from "@/components/common/responsive-dialog"
import { t } from "@/lib/i18n"
import { lastEmail } from "@/features/auth/session"
import { PRESET_ACCOUNTS, type MockFile } from "./store"
import { finishMockPicker, useMockPickerRequest } from "./picker"
import { grantPickerAccess, mockFileVisibleTo, mockFilesSharedWith } from "./drive"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Google-এর অ্যাকাউন্ট চুজারের মক
export function MockAccountChooser({ open, onOpenChange, onChoose }: { open: boolean; onOpenChange: (o: boolean) => void; onChoose: (email: string) => void }) {
  const last = lastEmail()
  const accounts = [...PRESET_ACCOUNTS].sort((a, b) => Number(b.email === last) - Number(a.email === last))
  const [other, setOther] = useState("")
  const [err, setErr] = useState<string | null>(null)
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange} title={t.login.chooseAccount}>
      <div className="flex flex-col gap-1">
        {accounts.map((a) => (
          <Button key={a.email} variant="ghost" className="h-14 w-full justify-start gap-3" onClick={() => onChoose(a.email)}>
            <AvatarInitial name={a.name} size="sm" />
            <span className="flex flex-col text-left">
              <span className="font-medium">{a.name}</span>
              <span className="text-xs text-stone-500">{a.email}</span>
            </span>
            {a.email === last && <span className="ml-auto text-xs text-stone-400">{t.login.lastUsed}</span>}
          </Button>
        ))}
        <form noValidate className="mt-2 flex flex-col gap-2 border-t border-stone-100 pt-3" onSubmit={(e) => { e.preventDefault(); const v = other.trim().toLowerCase(); if (!EMAIL_RE.test(v)) return setErr(t.share.invalidEmail); onChoose(v) }}>
          <p className="text-sm font-medium">{t.login.otherAccount}</p>
          <Field error={err}>
            <Input type="email" placeholder={t.login.emailPlaceholder} value={other} onChange={(e) => { setOther(e.target.value); setErr(null) }} />
          </Field>
          <Button type="submit" variant="outline">
            {t.login.continueBtn}
          </Button>
        </form>
      </div>
    </ResponsiveDialog>
  )
}

// Google Picker-এর মক: fileId দিলে শুধু ওই ফাইল, null দিলে এই অ্যাকাউন্টের সাথে শেয়ার করা সব খাতা
export function MockPickerDialog() {
  const req = useMockPickerRequest()
  const files = !req ? [] : req.fileId ? [mockFileVisibleTo(req.fileId, req.me)].filter((f): f is MockFile => f !== null) : mockFilesSharedWith(req.me)
  return (
    <ResponsiveDialog open={req !== null} onOpenChange={(o) => !o && finishMockPicker(null)} title={t.join.pickerTitle} description={t.join.pickerHint}>
      {req && files.length > 0 ? (
        <div className="flex flex-col gap-2">
          {files.map((file) => (
            <Button key={file.id} variant="outline" className="h-16 w-full justify-start" onClick={() => { grantPickerAccess(file.id, req.me); finishMockPicker(file.id) }}>
              <AppIcon name="sheet" size={24} className="text-emerald-700" />
              <span className="flex flex-col text-left">
                <span className="font-medium">{file.name}</span>
                <span className="text-xs text-stone-500">{file.ownerName} · {file.owner}</span>
              </span>
            </Button>
          ))}
        </div>
      ) : (
        <EmptyState icon="search" title={t.join.pickerEmpty} />
      )}
      <div className="mt-3 flex justify-end">
        <Button variant="outline" onClick={() => finishMockPicker(null)}>
          {t.common.cancel}
        </Button>
      </div>
    </ResponsiveDialog>
  )
}

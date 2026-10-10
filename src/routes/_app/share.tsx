import { createFileRoute } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { AppIcon } from "@/components/common/app-icon"
import { Field } from "@/components/common/field"
import { PageHeader } from "@/components/common/page-header"
import { useLedger } from "@/components/common/ledger-context"
import { QrCard } from "@/features/sharing/qr-card"
import { MemberList } from "@/features/sharing/member-list"
import { drive, type Member } from "@/features/google"
import { t } from "@/lib/i18n"

export const Route = createFileRoute("/_app/share")({ component: SharePage })
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// শুধু মালিক (ownedByMe) শেয়ার করতে পারে
function SharePage() {
  const { file, fileId, user } = useLedger()
  const [members, setMembers] = useState<Member[]>([])
  const [email, setEmail] = useState("")
  const [err, setErr] = useState<string | null>(null)
  const reload = () => drive.listMembers(fileId).then(setMembers).catch(() => setMembers([]))
  useEffect(() => {
    if (file?.ownedByMe) void reload()
  }, [fileId, file?.ownedByMe])

  if (!file?.ownedByMe) {
    return (
      <div>
        <PageHeader title={t.share.title} crumbs={[{ label: t.share.title }]} />
        <Alert className="border-sky-200 bg-sky-50 text-sky-900">
          <AppIcon name="share" />
          <AlertTitle>{t.share.notOwner}</AlertTitle>
          {file && <AlertDescription>{t.share.notOwnerHint(file.ownerName)}</AlertDescription>}
        </Alert>
      </div>
    )
  }
  const add = async () => {
    const v = email.trim().toLowerCase()
    if (!EMAIL_RE.test(v)) return setErr(t.share.invalidEmail)
    if (v === user.email) return setErr(t.share.selfEmail)
    if (members.some((m) => m.email === v)) return setErr(t.share.alreadyMember)
    await drive.addEditor(fileId, v)
    toast(t.share.added(v))
    setEmail("")
    void reload()
  }
  return (
    <div>
      <PageHeader title={t.share.title} crumbs={[{ label: t.share.title }]} />
      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
        <div className="flex flex-col gap-4 lg:order-2">
          <Card>
            <CardContent className="p-4">
              <form noValidate onSubmit={(e) => { e.preventDefault(); void add() }}>
                <Field label={t.share.emailLabel} error={err} htmlFor="share-email">
                  <div className="flex gap-2">
                    <Input id="share-email" type="email" inputMode="email" autoComplete="off" placeholder={t.share.emailPlaceholder} value={email} onChange={(e) => { setEmail(e.target.value); setErr(null) }} />
                    <Button type="submit">
                      <AppIcon name="plus" />
                      {t.share.add}
                    </Button>
                  </div>
                </Field>
              </form>
            </CardContent>
          </Card>
          {members.length > 1 ? (
            <MemberList members={members} onRemove={async (m) => { await drive.removeMember(fileId, m.permissionId); toast(t.share.removed); void reload() }} />
          ) : (
            <Alert>
              <AlertDescription>{t.share.noMembers}</AlertDescription>
            </Alert>
          )}
        </div>
        <QrCard fileId={fileId} />
      </div>
    </div>
  )
}

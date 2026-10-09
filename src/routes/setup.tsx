import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { AppIcon } from "@/components/common/app-icon"
import { BareLayout } from "@/components/common/bare-layout"
import { EmptyState } from "@/components/common/empty-state"
import { Field } from "@/components/common/field"
import { StatusBadge } from "@/components/common/status-badge"
import { t } from "@/lib/i18n/bn"
import { drive, type LedgerFile } from "@/features/google"
import { getSession, logout, setRedirect, useSession } from "@/features/auth/session"
import { activateLedger } from "@/features/auth/activate"

export const Route = createFileRoute("/setup")({
  validateSearch: z.object({ pick: z.string().optional() }),
  beforeLoad: ({ location }) => {
    if (!getSession().user) {
      setRedirect(location.href)
      throw redirect({ to: "/login" })
    }
  },
  component: SetupPage,
})

function SetupPage() {
  const { user } = useSession()
  const { pick } = Route.useSearch()
  const navigate = useNavigate()
  const [files, setFiles] = useState<LedgerFile[] | null>(null)
  const [name, setName] = useState(t.appName)
  const [err, setErr] = useState<string | null>(null)
  const activate = (id: string) => {
    activateLedger(id)
    void navigate({ to: "/", replace: true })
  }
  useEffect(() => {
    if (!user) return
    let alive = true
    drive.listLedgers(user.email).then((list) => {
      if (!alive) return
      if (list.length === 1 && !pick) return activate(list[0].id)
      setFiles(list)
    })
    return () => {
      alive = false
    }
  }, [user?.email, pick])
  if (!user) return null
  const create = async () => {
    const n = name.trim()
    if (!n) return setErr(t.common.required)
    const f = await drive.createLedger(user.email, user.name, n)
    toast(t.common.saved)
    activate(f.id)
  }
  return (
    <BareLayout>
      <div className="flex flex-col gap-4">
        <p className="text-center text-sm text-stone-500">
          {user.email} ·{" "}
          <Button variant="link" size="xs" className="h-auto p-0" onClick={() => { logout(); void navigate({ to: "/login", replace: true }) }}>
            {t.settings.signOut}
          </Button>
        </p>
        {files === null ? (
          <div className="flex flex-col items-center gap-3 py-6 text-sm text-stone-500">
            <Skeleton className="h-16 w-full" />
            {t.setup.searching}
          </div>
        ) : files.length === 0 ? (
          <EmptyState icon="sheet" title={t.setup.none} description={t.setup.noneHint} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>{t.setup.many}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 p-2">
              {files.map((f) => (
                <Button key={f.id} variant="ghost" className="h-auto w-full justify-start gap-3 py-3" onClick={() => activate(f.id)}>
                  <AppIcon name="sheet" size={24} className="text-emerald-700" />
                  <span className="flex min-w-0 flex-col text-left">
                    <span className="font-medium">{f.name}</span>
                    <span className="text-xs text-stone-500">{f.ownedByMe ? t.setup.ownedByYou : `${t.setup.sharedBy} ${f.ownerName}`}</span>
                  </span>
                  {!f.ownedByMe && <StatusBadge className="ml-auto">{t.share.editor}</StatusBadge>}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader>
            <CardTitle>{t.setup.createTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            <form noValidate className="flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); void create() }}>
              <Field label={t.setup.nameLabel} error={err} htmlFor="ledger-name">
                <Input id="ledger-name" value={name} placeholder={t.setup.namePlaceholder} onChange={(e) => { setName(e.target.value); setErr(null) }} />
              </Field>
              <Button type="submit" size="lg">
                <AppIcon name="plus" />
                {t.setup.create}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </BareLayout>
  )
}

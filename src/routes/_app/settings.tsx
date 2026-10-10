import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { AppIcon } from "@/components/common/app-icon"
import { AvatarInitial } from "@/components/common/avatar-initial"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { Field } from "@/components/common/field"
import { PageHeader } from "@/components/common/page-header"
import { ResponsiveDialog } from "@/components/common/responsive-dialog"
import { useLedger } from "@/components/common/ledger-context"
import { exportLedgerXlsx } from "@/features/export/to-xlsx"
import { selectEventGifts, selectEvents } from "@/features/ledger/queries"
import { deleteLedgerLocal } from "@/features/ledger/db"
import { seedData } from "@/features/ledger/seed"
import { auth, drive, isMock } from "@/features/google"
import { logout, resetEverything, setActiveFile } from "@/features/auth/session"
import { reset as resetSync, setSimulate, statusOf, syncNow, useSync } from "@/features/sync/sync-engine"
import { t } from "@/lib/i18n/bn"
import { formatDateTime, toBanglaDigits } from "@/lib/format"

export const Route = createFileRoute("/_app/settings")({ component: SettingsPage })
const DEV = isMock || import.meta.env.DEV
const Row = ({ children }: { children: React.ReactNode }) => <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">{children}</div>

function SettingsPage() {
  const { user, file, fileId, data, repo } = useLedger()
  const navigate = useNavigate()
  const sync = useSync()
  const [rename, setRename] = useState(false)
  const [name, setName] = useState(file?.name ?? "")
  const [nameErr, setNameErr] = useState<string | null>(null)
  const [clear, setClear] = useState(false)
  const [resetAll, setResetAll] = useState(false)
  const [signOutOpen, setSignOutOpen] = useState(false)
  const signOut = () => {
    logout()
    auth.clear()
    void navigate({ to: "/login", replace: true })
  }
  return (
    <div>
      <PageHeader title={t.settings.title} crumbs={[{ label: t.settings.title }]} />
      <div className="flex flex-col gap-4 md:flex-row md:items-start">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card>
            <CardHeader><CardTitle>{t.settings.account}</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-3">
              <AvatarInitial name={user.name} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{user.name}</p>
                <p className="truncate text-sm text-stone-500">{user.email}</p>
              </div>
              <Button variant="outline" onClick={() => setSignOutOpen(true)}><AppIcon name="logout" size={16} />{t.settings.signOut}</Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>{DEV ? t.settings.sim : t.sync.info}</CardTitle>
              {DEV && <CardDescription>{t.settings.simHint}</CardDescription>}
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-stone-100">
              {DEV && (
                <>
                  <SimRow label={t.settings.simOffline} hint={t.settings.simOfflineHint} checked={sync.simulate.offline} onChange={(v) => setSimulate({ offline: v })} />
                  <SimRow label={t.settings.simToken} hint={t.settings.simTokenHint} checked={sync.simulate.tokenExpired} onChange={(v) => setSimulate({ tokenExpired: v })} />
                  <SimRow label={t.settings.simTampered} hint={t.settings.simTamperedHint} checked={sync.simulate.tampered} onChange={(v) => setSimulate({ tampered: v })} />
                </>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
                <p className="text-xs text-stone-500">
                  {t.sync.lastSync}: {sync.lastSyncAt ? formatDateTime(sync.lastSyncAt) : t.sync.never}
                  {sync.pending ? ` · ${t.sync.pendingWrites(toBanglaDigits(sync.pending))}` : ""}
                  {sync.last ? ` · ${t.sync.lastCycle(toBanglaDigits(sync.last.pulled.gifts), toBanglaDigits(sync.last.updated), toBanglaDigits(sync.last.appended))}` : ""}
                  {sync.last?.rejected.length ? ` · ${t.settings.rejected(toBanglaDigits(sync.last.rejected.length))}` : ""}
                </p>
                <Button variant="outline" size="sm" disabled={statusOf(sync) === "syncing"} onClick={() => void syncNow()}><AppIcon name="sync" size={16} />{t.sync.syncNowBtn}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>{t.settings.ledger}</CardTitle>
              <CardDescription>{t.settings.backupNote}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div>
                <p className="font-medium">{file?.name ?? "—"}</p>
                <p className="text-xs text-stone-500">{t.settings.ownerLabel}: {file?.ownerName ?? "—"}</p>
              </div>
              <Row>
                {file?.ownedByMe && <Button variant="outline" onClick={() => { setName(file.name); setRename(true) }}><AppIcon name="edit" size={16} />{t.settings.rename}</Button>}
                <Button variant="outline" asChild>
                  <a href={`https://docs.google.com/spreadsheets/d/${fileId}`} target="_blank" rel="noopener" title={isMock ? t.settings.mock : undefined}><AppIcon name="sheet" size={16} />{t.settings.openSheet}</a>
                </Button>
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(fileId).then(() => toast(t.common.copied))}><AppIcon name="copy" size={16} />{t.settings.copyFileId}</Button>
                <Button variant="outline" onClick={() => exportLedgerXlsx(file?.name ?? t.appName, selectEvents(data), (id) => selectEventGifts(data, id))}><AppIcon name="download" size={16} />{t.settings.exportAll}</Button>
                <Button variant="outline" onClick={() => void navigate({ to: "/setup", search: { pick: "1" } })}><AppIcon name="book" size={16} />{t.settings.switchLedger}</Button>
              </Row>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t.settings.data}</CardTitle></CardHeader>
            <CardContent className="flex flex-col gap-3">
              <Row>
                {DEV && <Button variant="outline" onClick={async () => { await repo.bulkAdd(seedData(user.email)); toast(t.settings.seeded); void navigate({ to: "/events" }) }}><AppIcon name="gift" size={16} />{t.settings.seed}</Button>}
                {DEV && <Button variant="outline" onClick={() => void navigate({ to: "/join", search: { f: fileId } })}><AppIcon name="link" size={16} />{t.settings.openJoin}</Button>}
                {DEV && <Button variant="outline" className="text-red-600" onClick={() => setResetAll(true)}><AppIcon name="sync" size={16} />{t.settings.reset}</Button>}
                <Button variant="outline" className="text-red-600" onClick={() => setClear(true)}><AppIcon name="trash" size={16} />{t.settings.clear}</Button>
              </Row>
              <Separator />
              <p className="text-xs text-stone-400">v1.0 · {isMock ? "ডেমো মোড" : "Google Sheets"}</p>
            </CardContent>
          </Card>
        </div>
      </div>
      <ResponsiveDialog open={rename} onOpenChange={setRename} title={t.settings.rename}>
        <form noValidate className="flex flex-col gap-3" onSubmit={async (e) => { e.preventDefault(); const n = name.trim(); if (!n) return setNameErr(t.common.required); await drive.renameLedger(fileId, n); toast(t.settings.renamed); setRename(false); window.location.reload() }}>
          <Field label={t.settings.ledgerName} error={nameErr} htmlFor="rename">
            <Input id="rename" autoFocus value={name} placeholder={t.setup.namePlaceholder} onChange={(e) => { setName(e.target.value); setNameErr(null) }} />
          </Field>
          <Button type="submit">{t.common.save}</Button>
        </form>
      </ResponsiveDialog>
      <ConfirmDialog open={signOutOpen} onOpenChange={setSignOutOpen} title={t.settings.signOutTitle} description={t.settings.signOutDesc} confirmText={t.settings.signOut} onConfirm={signOut} />
      <ConfirmDialog open={clear} onOpenChange={setClear} title={t.settings.clearTitle} description={t.settings.clearDesc} confirmText={t.common.delete} onConfirm={async () => { await deleteLedgerLocal(fileId); setActiveFile(null); resetSync(); void navigate({ to: "/setup", search: { pick: "1" }, replace: true }) }} />
      <ConfirmDialog open={resetAll} onOpenChange={setResetAll} title={t.settings.resetTitle} description={t.settings.resetDesc} confirmText={t.settings.reset} onConfirm={async () => { await deleteLedgerLocal(fileId); resetEverything(); auth.clear(); window.location.href = "/login" }} />
    </div>
  )
}

const SimRow = ({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) => (
  <label className="flex cursor-pointer items-center justify-between gap-3 py-2">
    <span className="min-w-0">
      <span className="block text-sm font-medium">{label}</span>
      <span className="block text-xs text-stone-500">{hint}</span>
    </span>
    <Switch checked={checked} onCheckedChange={onChange} />
  </label>
)

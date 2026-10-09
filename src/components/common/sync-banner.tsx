import { useNavigate } from "@tanstack/react-router"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AppIcon } from "./app-icon"
import { t } from "@/lib/i18n/bn"
import { pause, reset, statusOf, useSync } from "@/features/sync/sync-engine"
import { deleteLedgerLocal } from "@/features/ledger/db"
import { setActiveFile } from "@/features/auth/session"

export function SyncBanner({ fileId }: { fileId: string }) {
  const s = useSync()
  const navigate = useNavigate()
  const status = statusOf(s)
  if (status !== "tampered" && status !== "revoked" && status !== "paused") return null
  const variant = status === "paused" ? "warning" : "destructive"
  const title = status === "paused" ? t.sync.paused : status === "tampered" ? t.sync.tampered : t.sync.revoked
  const desc = status === "paused" ? t.sync.pausedBanner : status === "tampered" ? t.sync.tamperedBanner : t.sync.revokedBanner
  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-4 sm:px-6 lg:max-w-5xl lg:px-10 lg:pt-8 print:hidden">
      <Alert className={variant === "destructive" ? "border-red-200 bg-red-50 text-red-900" : "border-amber-200 bg-amber-50 text-amber-900"}>
        <AppIcon name={status === "paused" ? "cloudOff" : "warning"} />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>
          <p>{desc}</p>
          {status === "revoked" && (
            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={pause}>
                {t.sync.keepCopy}
              </Button>
              <Button size="sm" className="bg-red-600 text-white hover:bg-red-700" onClick={async () => { await deleteLedgerLocal(fileId); setActiveFile(null); reset(); void navigate({ to: "/setup", replace: true }) }}>
                {t.sync.deleteCopy}
              </Button>
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  )
}

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useLocation } from "@tanstack/react-router"
import { PageSkeleton } from "./skeletons"
import { AppShell } from "./app-shell"
import { LedgerProvider, type Ledger } from "./ledger-context"
import { useSession } from "@/features/auth/session"
import { openLedger } from "@/features/ledger/db"
import { createRepo } from "@/features/ledger/repo"
import { useLedgerData } from "@/features/ledger/hooks"
import { drive, type LedgerFile } from "@/features/google"
import { onWrite, startSync } from "@/features/sync/sync-engine"

// সেশন → Dexie → repo → লাইভ ডাটা → context। _app লেআউট আর প্রিন্ট পাতা দুটোই এটা ব্যবহার করে।
export function LedgerGate({ children, shell = true }: { children: (ledger: Ledger) => ReactNode; shell?: boolean }) {
  const { user, fileId } = useSession()
  const pathname = useLocation().pathname
  const db = useMemo(() => (fileId ? openLedger(fileId) : null), [fileId])
  const repo = useMemo(() => (db && user ? createRepo(db, user.email, onWrite) : null), [db, user])
  const data = useLedgerData(db ?? openLedger("local-dev"))
  const [file, setFile] = useState<LedgerFile | null>(null)
  useEffect(() => {
    startSync()
  }, [])
  useEffect(() => {
    if (!fileId || !user) return
    let alive = true
    drive.getFile(fileId, user.email).then((f) => alive && setFile(f)).catch(() => alive && setFile(null))
    return () => {
      alive = false
    }
  }, [fileId, user])
  if (!user || !fileId || !db || !repo) return null
  const forceSkeleton = import.meta.env.DEV && typeof window !== "undefined" && new URLSearchParams(window.location.search).has("skeleton")
  if (!data || forceSkeleton) {
    const sk = <PageSkeleton pathname={pathname} />
    return shell ? (
      <AppShell user={user} file={file} fileId={fileId}>
        {sk}
      </AppShell>
    ) : (
      sk
    )
  }
  const ledger: Ledger = { fileId, user, file, db, repo, data }
  return <LedgerProvider value={ledger}>{children(ledger)}</LedgerProvider>
}

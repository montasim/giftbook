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

// খাতার নাম/মালিক localStorage-এ cache: অফলাইনে বা অনুমতি গেলে metadata পড়া যায় না, তখনও "—" নয়, শেষ জানা নামটা দেখাই
const fileKey = (fileId: string) => `uk-file-${fileId}`
const readCachedFile = (fileId: string | null): LedgerFile | null => {
  if (!fileId || typeof localStorage === "undefined") return null
  try {
    return JSON.parse(localStorage.getItem(fileKey(fileId)) ?? "null") as LedgerFile | null
  } catch {
    return null
  }
}

// সেশন → Dexie → repo → লাইভ ডাটা → context। _app লেআউট আর প্রিন্ট পাতা দুটোই এটা ব্যবহার করে।
export function LedgerGate({ children, shell = true }: { children: (ledger: Ledger) => ReactNode; shell?: boolean }) {
  const { user, fileId } = useSession()
  const pathname = useLocation().pathname
  const db = useMemo(() => (fileId ? openLedger(fileId) : null), [fileId])
  const repo = useMemo(() => (db && user ? createRepo(db, user.email, onWrite) : null), [db, user])
  const data = useLedgerData(db ?? openLedger("local-dev"))
  const [file, setFile] = useState<LedgerFile | null>(() => readCachedFile(fileId))
  useEffect(() => {
    startSync()
  }, [])
  useEffect(() => {
    if (!fileId || !user) return
    let alive = true
    setFile(readCachedFile(fileId))
    drive
      .getFile(fileId, user.email)
      .then((f) => {
        localStorage.setItem(fileKey(fileId), JSON.stringify(f))
        if (alive) setFile(f)
      })
      .catch(() => {}) // পড়া না গেলে cached-টাই থাকে
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

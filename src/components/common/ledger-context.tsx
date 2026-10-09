import { createContext, useContext } from "react"
import type { LedgerDB } from "@/features/ledger/db"
import type { Repo } from "@/features/ledger/repo"
import type { LedgerData } from "@/features/ledger/queries"
import type { GoogleUser, LedgerFile } from "@/features/google/types"

// _app লেআউট থেকে প্রতিটা পাতায়: db, repo, লাইভ ডাটা, ইউজার, ফাইল
export type Ledger = { fileId: string; user: GoogleUser; file: LedgerFile | null; db: LedgerDB; repo: Repo; data: LedgerData }
const Ctx = createContext<Ledger | null>(null)
export const LedgerProvider = Ctx.Provider
export function useLedger(): Ledger {
  const v = useContext(Ctx)
  if (!v) throw new Error("useLedger outside _app")
  return v
}

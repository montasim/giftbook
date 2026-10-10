import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"
import { AppShell } from "@/components/common/app-shell"
import { LedgerGate } from "@/components/common/ledger-gate"
import { getSession, setRedirect } from "@/features/auth/session"

// পাহারা: লগইন নেই → /login (ফেরার পথ মনে রেখে) · খাতা নেই → /setup
export const Route = createFileRoute("/_app")({
  beforeLoad: ({ location }) => {
    const s = getSession()
    if (!s.user) {
      if (location.pathname === "/") throw redirect({ to: "/welcome" }) // লগইন-ছাড়া হোম = ল্যান্ডিং
      setRedirect(location.href)
      throw redirect({ to: "/login" })
    }
    if (!s.fileId) throw redirect({ to: "/setup" })
  },
  component: () => (
    <LedgerGate>
      {(l) => (
        <AppShell user={l.user} file={l.file} fileId={l.fileId}>
          <Outlet />
        </AppShell>
      )}
    </LedgerGate>
  ),
})

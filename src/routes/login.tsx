import { Link, createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AppIcon } from "@/components/common/app-icon"
import { BareLayout } from "@/components/common/bare-layout"
import { t } from "@/lib/i18n/bn"
import { auth, isMock } from "@/features/google"
import { chooseMockAccount } from "@/features/google/mock/auth"
import { MockAccountChooser } from "@/features/google/mock/ui"
import { lastEmail, login, takeRedirect, useSession } from "@/features/auth/session"

export const Route = createFileRoute("/login")({ component: LoginPage })

function LoginPage() {
  const { user } = useSession()
  const navigate = useNavigate()
  const [chooser, setChooser] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    if (user) void navigate({ to: takeRedirect() ?? "/events", replace: true })
  }, [user, navigate])

  // login() → useSession বদলায় → উপরের effect ফেরার পথে নেয় (redirect থাকলে সেখানে, নইলে / → guard → /setup)
  const finish = async () => {
    const u = await auth.fetchUser()
    login(u)
  }
  const signIn = async () => {
    if (isMock) return setChooser(true)
    setBusy(true)
    try {
      await auth.requestToken(lastEmail() ?? undefined) // ইউজারের চাপে Google পপআপ
      await finish()
    } catch {
      toast.error(t.login.failed)
    } finally {
      setBusy(false)
    }
  }
  return (
    <BareLayout brand={false}>{/* কার্ডেই বড় লোগো+নাম আছে — উপরে আবার নয় */}
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
          <img src="/logo.svg" alt="" className="h-20 w-20" />
          <h1 className="text-2xl font-bold">{t.login.title}</h1>
          <p className="text-stone-500">{t.login.subtitle}</p>
          <Button size="lg" className="mt-2 w-full" disabled={busy} onClick={() => void signIn()}>
            <AppIcon name="google" size={20} />
            {t.login.google}
          </Button>
          <p className="text-xs text-stone-500">{t.login.permissionNote}</p>
          <p className="text-xs text-stone-400">{t.login.flowNote}</p>
          <p className="flex gap-3 text-xs text-stone-400">
            <Link to="/" className="underline-offset-2 hover:underline">{t.landing.link}</Link>
            <Link to="/privacy" className="underline-offset-2 hover:underline">{t.privacy.link}</Link>
            <Link to="/contact" className="underline-offset-2 hover:underline">{t.contact.link}</Link>
          </p>
        </CardContent>
      </Card>
      {isMock && (
        <>
          <Alert className="mt-4 border-sky-200 bg-sky-50 text-sky-900">
            <AppIcon name="info" />
            <AlertDescription>{t.login.mockNote}</AlertDescription>
          </Alert>
          <MockAccountChooser open={chooser} onOpenChange={setChooser} onChoose={(email) => { chooseMockAccount(email); setChooser(false); void finish() }} />
        </>
      )}
    </BareLayout>
  )
}

import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { z } from "zod"
import { Alert, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { AppIcon } from "@/components/common/app-icon"
import { BareLayout } from "@/components/common/bare-layout"
import { t } from "@/lib/i18n/bn"
import { auth, drive, isMock, picker } from "@/features/google"
import { MockPickerDialog } from "@/features/google/mock/ui"
import { logout, setRedirect, useSession } from "@/features/auth/session"
import { activateLedger } from "@/features/auth/activate"

export const Route = createFileRoute("/join")({
  validateSearch: z.object({ f: z.string().catch("") }),
  component: JoinPage,
})

type Phase = "checking" | "card" | "notMember"

// /join?f=<fileId> — ফোনের ক্যামেরা QR স্ক্যান করলে এখানে আসে
function JoinPage() {
  const { f } = Route.useSearch()
  const { user } = useSession()
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>("checking")
  const ran = useRef(false)
  const valid = f.length >= 10

  useEffect(() => {
    if (!valid) return
    if (!user) {
      setRedirect(`/join?f=${f}`)
      void navigate({ to: "/login", replace: true })
      return
    }
    if (ran.current) return // রি-রেন্ডারে দুবার না
    ran.current = true
    drive
      .getFile(f, user.email) // প্রথম চেষ্টা: Picker ছাড়া সরাসরি
      .then(() => activate())
      .catch(() => setPhase("card"))
  }, [user, f, valid])

  const activate = () => {
    toast(t.join.success)
    activateLedger(f)
    void navigate({ to: "/", replace: true })
  }
  const switchAccount = () => {
    logout()
    auth.clear()
    setRedirect(`/join?f=${f}`)
    void navigate({ to: "/login", replace: true })
  }
  const openPicker = async () => {
    if (!user) return
    const token = auth.currentToken() ?? (await auth.requestToken(user.email))
    const id = await picker.pickSharedFile(f, token, user.email)
    if (id === f) activate()
    else setPhase("notMember")
  }

  if (!valid)
    return (
      <BareLayout>
        <Alert className="border-red-200 bg-red-50 text-red-900">
          <AppIcon name="warning" />
          <AlertTitle>{t.join.badLink}</AlertTitle>
        </Alert>
      </BareLayout>
    )
  if (!user) return null
  return (
    <BareLayout>
      {phase === "checking" && (
        <div className="flex flex-col items-center gap-3 py-8 text-stone-500">
          <Skeleton className="h-16 w-full" />
          {t.join.checking}
        </div>
      )}
      {phase === "card" && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
              <AppIcon name="sheet" size={32} />
            </span>
            <p className="text-lg font-semibold">{t.join.title}</p>
            <p className="text-sm text-stone-500">
              {t.join.signedInAs} <b>{user.email}</b>
            </p>
            <Button size="lg" className="w-full" onClick={() => void openPicker()}>
              {t.join.open}
            </Button>
            <Button variant="outline" onClick={switchAccount}>
              {t.join.switchAccount}
            </Button>
          </CardContent>
        </Card>
      )}
      {phase === "notMember" && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
              <AppIcon name="key" size={32} />
            </span>
            <p className="text-lg font-semibold">{t.join.notMemberTitle}</p>
            <p className="text-sm text-stone-600">{t.join.notMember(user.email)}</p>
            <Button variant="outline" onClick={switchAccount}>
              {t.join.switchAccount}
            </Button>
          </CardContent>
        </Card>
      )}
      {isMock && <MockPickerDialog />}
    </BareLayout>
  )
}

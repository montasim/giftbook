import { Link, createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AppIcon } from "@/components/common/app-icon"
import { Money } from "@/components/common/money"
import { Stat } from "@/components/common/stat"
import { StatusBadge } from "@/components/common/status-badge"
import { type IconName } from "@/config/icons"
import { t } from "@/lib/i18n"
import { digits } from "@/lib/format"
import { useSession } from "@/features/auth/session"
import { cn } from "@/lib/utils"

export const Route = createFileRoute("/")({ component: LandingPage })

// ল্যান্ডিং: / সবসময় এটা; অ্যাপের হোম /events। অ্যাপের থিমেই (emerald/stone, Hind Siliguri, shadcn কার্ড)।
function LandingPage() {
  const { user } = useSession()
  const l = t.landing
  const cta = user ? { to: "/events" as const, label: l.openApp } : { to: "/login" as const, label: l.ctaPrimary }
  return (
    <div className="min-h-dvh bg-stone-50 text-stone-900">
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-4 sm:px-6 lg:max-w-5xl lg:px-10">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <img src="/logo.svg" alt="" className="h-8 w-8" />
            {t.appName}
          </Link>
          <nav className="ml-auto hidden items-center gap-5 text-sm text-stone-600 sm:flex">
            <a href="#features" className="hover:text-stone-900">{l.nav.features}</a>
            <a href="#how" className="hover:text-stone-900">{l.nav.how}</a>
            <a href="#faq" className="hover:text-stone-900">{l.nav.faq}</a>
          </nav>
          <Button asChild size="sm" className="ml-auto sm:ml-0">
            <Link to={cta.to}>{user ? l.openApp : l.login}</Link>
          </Button>
        </div>
      </header>

      <main>
        {/* hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[32rem] bg-[radial-gradient(60rem_24rem_at_50%_-4rem,theme(colors.emerald.100),transparent)]" />
          <div className="mx-auto grid max-w-3xl gap-10 px-4 py-14 sm:px-6 lg:max-w-5xl lg:grid-cols-[1.1fr_1fr] lg:items-center lg:px-10 lg:py-20">
            <div className="flex flex-col gap-5">
              <h1 className="text-4xl font-bold leading-tight text-emerald-900 sm:text-5xl">{l.heroTitle}</h1>
              <p className="max-w-xl text-lg text-stone-600">{l.heroSub}</p>
              <div className="flex flex-wrap gap-3">
                <Button asChild size="lg">
                  <Link to={cta.to}><AppIcon name={user ? "home" : "google"} />{cta.label}</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <a href="#how">{l.ctaSecondary}<AppIcon name="chevronRight" size={16} /></a>
                </Button>
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-stone-500">
                {l.trust.map((x) => (
                  <li key={x} className="flex items-center gap-1.5"><AppIcon name="check" size={16} className="text-emerald-700" />{x}</li>
                ))}
              </ul>
            </div>
            <DemoCard />
          </div>
        </section>

        {/* features */}
        <section id="features" className="scroll-mt-16 bg-white py-14 lg:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-5xl lg:px-10">
            <SectionHead title={l.featuresTitle} sub={l.featuresSub} />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {l.features.map((f) => (
                <Card key={f.h} className="gap-3 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                    <AppIcon name={f.icon as IconName} size={20} />
                  </span>
                  <h3 className="font-semibold">{f.h}</h3>
                  <p className="text-sm leading-relaxed text-stone-600">{f.p}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* how */}
        <section id="how" className="scroll-mt-16 py-14 lg:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-5xl lg:px-10">
            <SectionHead title={l.howTitle} sub={l.howSub} />
            <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {l.how.map((s, i) => (
                <li key={s.h} className="flex gap-4 sm:flex-col">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-lg font-bold text-white">{digits(i + 1)}</span>
                  <div>
                    <h3 className="font-semibold">{s.h}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600">{s.p}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* privacy */}
        <section className="bg-emerald-900 py-14 text-emerald-50 lg:py-16">
          <div className="mx-auto grid max-w-3xl gap-6 px-4 sm:px-6 lg:max-w-5xl lg:grid-cols-[1fr_1.2fr] lg:items-center lg:px-10">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-800"><AppIcon name="key" size={24} /></span>
              <h2 className="text-2xl font-bold sm:text-3xl">{l.privacyTitle}</h2>
            </div>
            <div className="flex flex-col gap-3">
              {l.privacyPoints.map((p) => (
                <p key={p} className="flex items-start gap-2 text-emerald-100"><AppIcon name="check" size={20} className="mt-0.5 shrink-0 text-emerald-300" />{p}</p>
              ))}
              <Link to="/privacy" className="mt-1 w-fit text-sm font-medium text-emerald-200 underline-offset-4 hover:underline">{l.privacyLink} →</Link>
            </div>
          </div>
        </section>

        {/* faq */}
        <section id="faq" className="scroll-mt-16 py-14 lg:py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-10">
            <SectionHead title={l.faqTitle} />
            <div className="mt-8 divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
              {l.faq.map((f) => (
                <details key={f.q} className="group px-5 py-4">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <AppIcon name="chevronDown" size={16} className="shrink-0 text-stone-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* bottom cta */}
        <section className="pb-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-5xl lg:px-10">
            <Card className="items-center gap-4 bg-gradient-to-br from-emerald-50 to-white p-8 text-center sm:p-12">
              <img src="/logo.svg" alt="" className="h-16 w-16" />
              <h2 className="text-2xl font-bold sm:text-3xl">{l.bottomTitle}</h2>
              <p className="text-stone-600">{l.bottomSub}</p>
              <Button asChild size="lg">
                <Link to={cta.to}><AppIcon name={user ? "home" : "google"} />{cta.label}</Link>
              </Button>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t border-stone-200 bg-white">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-6 text-sm text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:max-w-5xl lg:px-10">
          <span className="flex items-center gap-2"><img src="/logo.svg" alt="" className="h-6 w-6" />{t.appName} · {l.footerMade}</span>
          <nav className="flex gap-4">
            <Link to="/about" className="hover:underline">{t.about.link}</Link>
            <Link to="/privacy" className="hover:underline">{t.privacy.link}</Link>
            <Link to="/contact" className="hover:underline">{t.contact.link}</Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

const SectionHead = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="max-w-2xl">
    <h2 className="text-2xl font-bold sm:text-3xl">{title}</h2>
    {sub && <p className="mt-2 text-stone-600">{sub}</p>}
  </div>
)

// হিরোর নমুনা: অ্যাপের আসল কম্পোনেন্ট (Stat, Money, StatusBadge) দিয়ে, যাতে দেখতে অ্যাপের মতোই হয়
function DemoCard() {
  const l = t.landing
  return (
    <div className="relative">
      <div className="absolute -inset-4 -z-10 rounded-3xl bg-emerald-200/40 blur-2xl" />
      <Card className="gap-0 overflow-hidden p-0 shadow-xl shadow-emerald-900/10">
        <div className="border-b border-stone-100 px-5 py-4">
          <p className="text-lg font-bold">{l.demoEvent}</p>
          <p className="text-xs text-stone-500">{l.demoMeta}</p>
        </div>
        <div className="grid grid-cols-3 gap-2 p-3">
          <Stat label={t.event.received} value={<Money value={45500} tone="received" />} />
          <Stat label={t.event.given} value={<Money value={2000} tone="given" />} />
          <Stat label={t.event.pendingTitle} value={<span className="font-semibold text-amber-700">{digits(3)}</span>} />
        </div>
        <ul className="divide-y divide-stone-100">
          {l.demoRows.map((r) => {
            const pending = r.amount == null && !r.item
            return (
              <li key={r.name} className={cn("flex items-center gap-3 px-5 py-3", pending && "bg-amber-50/60")}>
                <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full", r.dir === "received" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                  <AppIcon name={r.dir === "received" ? "in" : "out"} size={20} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium">{r.name}</span>
                  <span className="block truncate text-xs text-stone-500">{r.sub}</span>
                </span>
                {pending ? <StatusBadge tone="warning">{t.gift.pending}</StatusBadge> : <Money value={r.amount} tone={r.dir === "received" ? "received" : "given"} />}
              </li>
            )
          })}
        </ul>
      </Card>
    </div>
  )
}

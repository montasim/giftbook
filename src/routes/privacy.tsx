import { Link, createFileRoute } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"
import { t } from "@/lib/i18n/bn"

export const Route = createFileRoute("/privacy")({ component: PrivacyPage })

// Google OAuth consent screen-এর privacy policy লিংক এখানে আসে — তাই পাতাটা পাবলিক, লগইন ছাড়া
function PrivacyPage() {
  const p = t.privacy
  return (
    <div className="min-h-dvh px-4 py-8 sm:px-6 lg:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <Link to="/login" className="mb-6 flex w-fit items-center gap-2 text-lg font-bold">
          <img src="/logo.svg" alt="" className="h-9 w-9" />
          {t.appName}
        </Link>
        <Card>
          <CardContent className="flex flex-col gap-6 p-6 text-base leading-relaxed text-stone-700 sm:p-8 lg:p-10">
            <div>
              <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">{p.title}</h1>
              <p className="mt-1 text-sm text-stone-400">{p.updated}</p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              {p.sections.map((s) => (
                <section key={s.h} className="flex flex-col gap-1.5">
                  <h2 className="text-lg font-semibold text-stone-900">{s.h}</h2>
                  <p>{s.p}</p>
                </section>
              ))}
            </div>
            <hr className="border-stone-200" />
            <section className="flex flex-col gap-1.5 text-stone-500">
              <h2 className="text-lg font-semibold text-stone-700">Privacy Policy (English summary)</h2>
              <p>{p.english}</p>
            </section>
            <Link to="/login" className="w-fit font-medium text-emerald-700 hover:underline">{t.common.back}</Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

import { Link, createFileRoute } from "@tanstack/react-router"
import { PublicLayout } from "@/components/common/public-layout"
import { Card, CardContent } from "@/components/ui/card"
import { t } from "@/lib/i18n"

export const Route = createFileRoute("/privacy")({ component: PrivacyPage })

// Google OAuth consent screen-এর privacy policy লিংক এখানে আসে — তাই পাতাটা পাবলিক, লগইন ছাড়া
function PrivacyPage() {
  const p = t.privacy
  // dev: ?crash=1 → 500 পাতা পরীক্ষা
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).has("crash")) throw new Error("test crash")
  return (
    <PublicLayout>
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
    </PublicLayout>
  )
}

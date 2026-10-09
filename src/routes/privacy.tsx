import { Link, createFileRoute } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"
import { BareLayout } from "@/components/common/bare-layout"
import { t } from "@/lib/i18n/bn"

export const Route = createFileRoute("/privacy")({ component: PrivacyPage })

// Google OAuth consent screen-এর privacy policy লিংক এখানে আসে — তাই পাতাটা পাবলিক, লগইন ছাড়া
function PrivacyPage() {
  const p = t.privacy
  return (
    <BareLayout>
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 text-sm leading-relaxed text-stone-700">
          <h1 className="text-2xl font-bold text-stone-900">{p.title}</h1>
          <p className="text-xs text-stone-400">{p.updated}</p>
          {p.sections.map((s) => (
            <section key={s.h} className="flex flex-col gap-1">
              <h2 className="font-semibold text-stone-900">{s.h}</h2>
              <p>{s.p}</p>
            </section>
          ))}
          <hr className="border-stone-200" />
          <section className="flex flex-col gap-1 text-stone-500">
            <h2 className="font-semibold text-stone-700">Privacy Policy (English summary)</h2>
            <p>{p.english}</p>
          </section>
          <Link to="/login" className="text-emerald-700 hover:underline">{t.common.back}</Link>
        </CardContent>
      </Card>
    </BareLayout>
  )
}

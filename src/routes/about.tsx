import { Link, createFileRoute } from "@tanstack/react-router"
import { Card, CardContent } from "@/components/ui/card"
import { AppIcon } from "@/components/common/app-icon"
import { PublicLayout } from "@/components/common/public-layout"
import { t } from "@/lib/i18n"
import { site } from "@/config/site"

export const Route = createFileRoute("/about")({ component: AboutPage })

// পাবলিক: অ্যাপটা কী, কেন, কীভাবে চলে; ডেভেলপারের পরিচয় ও ইমেইল
function AboutPage() {
  const a = t.about
  return (
    <PublicLayout>
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 text-base leading-relaxed text-stone-700 sm:p-8 lg:p-10">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">{a.title}</h1>
            <p className="mt-2 text-stone-600">{a.lead}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2">
            {a.sections.map((s) => (
              <section key={s.h} className="flex flex-col gap-1.5">
                <h2 className="text-lg font-semibold text-stone-900">{s.h}</h2>
                <p>{s.p}</p>
              </section>
            ))}
          </div>
          <hr className="border-stone-200" />
          <section className="flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-800">{a.developerTitle}</p>
              <p className="text-lg font-semibold text-emerald-900">{a.developerName}</p>
              <p className="text-sm text-emerald-800">{a.developerNote}</p>
            </div>
            <a href={`mailto:${site.supportEmail}`} className="flex items-center gap-2 font-medium text-emerald-900 hover:underline">
              <AppIcon name="send" size={16} />
              {site.supportEmail}
            </a>
          </section>
          <nav className="flex gap-4 text-sm">
            <Link to="/privacy" className="font-medium text-emerald-700 hover:underline">{t.privacy.link}</Link>
            <Link to="/contact" className="font-medium text-emerald-700 hover:underline">{t.contact.link}</Link>
          </nav>
        </CardContent>
      </Card>
    </PublicLayout>
  )
}

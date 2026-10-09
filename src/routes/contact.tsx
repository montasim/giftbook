import { createFileRoute } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AppIcon } from "@/components/common/app-icon"
import { PublicLayout } from "@/components/common/public-layout"
import { t } from "@/lib/i18n/bn"
import { site } from "@/config/site"

export const Route = createFileRoute("/contact")({ component: ContactPage })

// পাবলিক: সমস্যা জানানোর ইমেইল + কী লিখলে ভালো
function ContactPage() {
  const c = t.contact
  const mail = `mailto:${site.supportEmail}?subject=${encodeURIComponent(c.subject)}`
  return (
    <PublicLayout>
      <Card>
        <CardContent className="flex flex-col gap-6 p-6 sm:p-8 lg:p-10">
          <div>
            <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">{c.title}</h1>
            <p className="mt-2 text-stone-600">{c.lead}</p>
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-emerald-800">{c.emailLabel}</p>
              <a href={mail} className="text-lg font-semibold text-emerald-900 hover:underline">{site.supportEmail}</a>
            </div>
            <Button asChild>
              <a href={mail}><AppIcon name="send" />{c.mail}</a>
            </Button>
          </div>
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-stone-900">{c.includeTitle}</h2>
            <ul className="list-disc space-y-1 pl-5 text-stone-700">
              {c.include.map((x) => <li key={x}>{x}</li>)}
            </ul>
            <p className="text-sm text-stone-500">{c.privacyNote}</p>
          </section>
        </CardContent>
      </Card>
    </PublicLayout>
  )
}

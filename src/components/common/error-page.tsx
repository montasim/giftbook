import { Link, type ErrorComponentProps } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { AppIcon } from "./app-icon"
import { PublicLayout } from "./public-layout"
import { t } from "@/lib/i18n/bn"
import { site } from "@/config/site"

// রানটাইম এরর (500): TanStack-এর ডিফল্ট "Something went wrong" বদলে — বাংলায়, আবার চেষ্টা / হোম / যোগাযোগ
export function ErrorPage({ error, reset }: ErrorComponentProps) {
  const detail = error instanceof Error ? `${error.name}: ${error.message}` : String(error)
  const mail = `mailto:${site.supportEmail}?subject=${encodeURIComponent(t.contact.subject)}&body=${encodeURIComponent(`${location.href}\n\n${detail}`)}`
  return (
    <PublicLayout>
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-7xl font-bold text-red-600">{t.errors.crashCode}</p>
        <h1 className="text-2xl font-bold">{t.errors.crashTitle}</h1>
        <p className="max-w-md text-stone-500">{t.errors.crashDesc}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Button onClick={reset}><AppIcon name="sync" />{t.errors.retry}</Button>
          <Button variant="outline" asChild>
            <Link to="/events"><AppIcon name="home" />{t.common.goHome}</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href={mail}>{t.contact.link}</a>
          </Button>
        </div>
        <details className="mt-4 w-full max-w-lg text-left text-xs text-stone-500">
          <summary className="cursor-pointer">{t.errors.details}</summary>
          <pre className="mt-2 overflow-auto rounded-lg bg-stone-100 p-3 whitespace-pre-wrap">{detail}</pre>
        </details>
      </div>
    </PublicLayout>
  )
}

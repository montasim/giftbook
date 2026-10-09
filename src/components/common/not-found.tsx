import { Link } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { AppIcon } from "./app-icon"
import { EmptyState } from "./empty-state"
import { PublicLayout } from "./public-layout"
import { t } from "@/lib/i18n/bn"

// শেলের ভেতরে (অনুষ্ঠান/মানুষ পাওয়া যায়নি) — ছোট
export function NotFound() {
  return (
    <EmptyState icon="search" title={t.common.notFound}>
      <Button variant="outline" asChild>
        <Link to="/">{t.common.goHome}</Link>
      </Button>
    </EmptyState>
  )
}

// পুরো পাতা — রুট না মিললে (404)
export function NotFoundPage() {
  return (
    <PublicLayout>
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-7xl font-bold text-emerald-700">{t.errors.notFoundCode}</p>
        <h1 className="text-2xl font-bold">{t.errors.notFoundTitle}</h1>
        <p className="max-w-md text-stone-500">{t.errors.notFoundDesc}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Button asChild>
            <Link to="/"><AppIcon name="home" />{t.common.goHome}</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/contact">{t.contact.link}</Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  )
}

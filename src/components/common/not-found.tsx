import { useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { EmptyState } from "./empty-state"
import { t } from "@/lib/i18n/bn"

export function NotFound() {
  const navigate = useNavigate()
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <EmptyState icon="search" title={t.common.notFound}>
        <Button variant="outline" onClick={() => navigate({ to: "/" })}>
          {t.common.goHome}
        </Button>
      </EmptyState>
    </div>
  )
}

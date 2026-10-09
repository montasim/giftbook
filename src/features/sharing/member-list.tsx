import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AppIcon } from "@/components/common/app-icon"
import { AvatarInitial } from "@/components/common/avatar-initial"
import { StatusBadge } from "@/components/common/status-badge"
import { ConfirmDialog } from "@/components/common/confirm-dialog"
import { t } from "@/lib/i18n/bn"
import type { Member } from "@/features/google/types"

export function MemberList({ members, onRemove }: { members: Member[]; onRemove: (m: Member) => void }) {
  const [target, setTarget] = useState<Member | null>(null)
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.share.members}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col divide-y divide-stone-100 p-0 pb-1">
        {members.map((m) => (
          <div key={m.permissionId} className="flex items-center gap-3 px-4 py-2.5">
            <AvatarInitial name={m.name ?? m.email} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{m.name ?? m.email.split("@")[0]}</p>
              <p className="truncate text-xs text-stone-500">{m.email}</p>
            </div>
            <StatusBadge tone={m.role === "owner" ? "dark" : "neutral"}>{m.role === "owner" ? t.share.owner : t.share.editor}</StatusBadge>
            {m.role !== "owner" && (
              <Button variant="ghost" size="icon-xs" aria-label={t.share.remove} className="text-red-600" onClick={() => setTarget(m)}>
                <AppIcon name="trash" size={16} />
              </Button>
            )}
          </div>
        ))}
      </CardContent>
      <ConfirmDialog open={target !== null} onOpenChange={(o) => !o && setTarget(null)} title={t.share.removeTitle} description={target ? t.share.removeDesc(target.email) : undefined} confirmText={t.share.remove} onConfirm={() => { if (target) onRemove(target); setTarget(null) }} />
    </Card>
  )
}

import { QRCodeSVG } from "qrcode.react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AppIcon } from "@/components/common/app-icon"
import { t } from "@/lib/i18n/bn"

// 🔐 লিংকে শুধু ফাইলের আইডি
export const joinUrl = (fileId: string) => `${window.location.origin}/join?f=${fileId}`

export function QrCard({ fileId }: { fileId: string }) {
  const url = joinUrl(fileId)
  const share = async () => {
    const text = `${t.share.shareText} ${url}`
    if (navigator.share) return navigator.share({ title: t.appName, text, url }).catch(() => {})
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank")
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.share.qrTitle}</CardTitle>
        <CardDescription>{t.share.qrHint}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-3">
        <QRCodeSVG value={url} size={200} marginSize={1} className="rounded-lg bg-white" />
        <p className="max-w-full truncate text-xs text-stone-400">{url}</p>
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" onClick={() => navigator.clipboard.writeText(url).then(() => toast(t.common.copied))}>
            <AppIcon name="copy" size={16} />
            {t.common.copy}
          </Button>
          <Button onClick={() => void share()}>
            <AppIcon name="send" size={16} />
            {t.common.send}
          </Button>
        </div>
        <p className="text-center text-xs text-stone-500">{t.share.securityNote}</p>
      </CardContent>
    </Card>
  )
}

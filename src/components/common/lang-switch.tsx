import { Button } from "@/components/ui/button"
import { setLang, t } from "@/lib/i18n"
import { cn } from "@/lib/utils"

// অন্য ভাষায় যাওয়ার বাটন: bn-এ "English", en-এ "বাংলা" (দৃশ্যমান লেখাই accessible name; title = "ভাষা"/"Language")। বদলালে reload (t module-init-এ ঠিক হয়)।
// button=false → ফুটার/হেডারের লিংকের মতো টেক্সট; button=true → সেটিংসের outline বাটন
export function LangSwitch({ className, button = false }: { className?: string; button?: boolean }) {
  const go = () => setLang(t.lang.otherCode)
  if (button) {
    return (
      <Button type="button" variant="outline" size="sm" className={className} lang={t.lang.otherCode} title={t.lang.label} onClick={go}>
        {t.lang.other}
      </Button>
    )
  }
  return (
    <button type="button" className={cn("hover:underline", className)} lang={t.lang.otherCode} title={t.lang.label} onClick={go}>
      {t.lang.other}
    </button>
  )
}

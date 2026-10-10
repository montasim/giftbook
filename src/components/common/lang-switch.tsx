import { Button } from "@/components/ui/button"
import { setLang, t } from "@/lib/i18n"
import { cn } from "@/lib/utils"

// অন্য ভাষায় যাওয়ার বাটন: bn-এ "English", en-এ "বাংলা" (দৃশ্যমান লেখাই accessible name; title = "ভাষা"/"Language")। বদলালে reload (t module-init-এ ঠিক হয়)।
// button=false → ছোট বর্ডারওয়ালা পিল (হেডার/ফুটার, লিংকের ভিড়ে আলাদা দেখায়); button=true → সেটিংসের outline বাটন
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
    <button type="button" className={cn("rounded-md border border-stone-300 px-2 py-0.5 text-stone-600 hover:border-stone-400 hover:bg-stone-100 hover:text-stone-900", className)} lang={t.lang.otherCode} title={t.lang.label} onClick={go}>
      {t.lang.other}
    </button>
  )
}

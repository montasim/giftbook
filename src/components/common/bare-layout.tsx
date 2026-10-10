import type { ReactNode } from "react"
import { t } from "@/lib/i18n"

// login / setup / join — ব্র্যান্ড উপরে, max-w-md কার্ড, পর্দার মাঝখানে (ছোট পর্দায় উপর থেকে)
export const BareLayout = ({ children, brand = true }: { children: ReactNode; brand?: boolean }) => (
  <div className="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
    {brand && (
      <div className="mb-6 flex items-center gap-2 text-lg font-bold">
        <img src="/logo.svg" alt="" className="h-9 w-9" />
        {t.appName}
      </div>
    )}
    <div className="w-full max-w-md">{children}</div>
  </div>
)

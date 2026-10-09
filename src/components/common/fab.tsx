import { Button } from "@/components/ui/button"
import { AppIcon } from "./app-icon"
import type { IconName } from "@/config/icons"

// মোবাইল-only ভাসমান বাটন, bottom tab bar-এর উপরে
export const Fab = ({ icon = "plus", label, onClick }: { icon?: IconName; label: string; onClick: () => void }) => (
  <Button size="lg" aria-label={label} onClick={onClick} className="fixed right-4 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 h-14 rounded-full px-5 shadow-lg sm:hidden print:hidden">
    <AppIcon name={icon} size={24} />
    {label}
  </Button>
)

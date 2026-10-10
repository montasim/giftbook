import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { buttonVariants } from "@/components/ui/button"
import { t } from "@/lib/i18n"
import { cn } from "@/lib/utils"

export function ConfirmDialog({ open, onOpenChange, title, description, confirmText = t.common.confirm, destructive = true, onConfirm }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; confirmText?: string; destructive?: boolean; onConfirm: () => void }) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-white">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
          <AlertDialogAction className={cn(destructive && buttonVariants({ variant: "destructive" }), destructive && "bg-red-600 text-white hover:bg-red-700")} onClick={onConfirm}>
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

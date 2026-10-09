import { setActiveFile } from "./session"
import { reset } from "@/features/sync/sync-engine"

export function activateLedger(fileId: string) {
  setActiveFile(fileId)
  reset()
}

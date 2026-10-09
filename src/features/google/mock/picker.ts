import { useSyncExternalStore } from "react"
import type { PickerApi } from "../types"

// UI (MockPickerDialog) এই প্রমিজ resolve করে
let resolver: ((id: string | null) => void) | null = null
const listeners = new Set<() => void>()
let request: { fileId: string | null; me: string } | null = null
const emit = () => listeners.forEach((l) => l())

export const mockPicker: PickerApi = {
  pickSharedFile(fileId, _token, me) {
    return new Promise((resolve) => {
      resolver = resolve
      request = { fileId, me }
      emit()
    })
  },
}
export const finishMockPicker = (id: string | null) => {
  request = null
  const r = resolver
  resolver = null
  emit()
  r?.(id)
}
export const useMockPickerRequest = () => useSyncExternalStore((l) => (listeners.add(l), () => listeners.delete(l)), () => request, () => null)

import type { IconName } from "./icons.ts"
import { t } from "../lib/i18n/index.ts"

// ধরন যোগ/বদল শুধু এখানে; লেবেল i18n-এ (t.eventTypes)
export const EVENT_TYPES = {
  wedding: { label: t.eventTypes.wedding, icon: "wedding" },
  holud: { label: t.eventTypes.holud, icon: "holud" },
  walima: { label: t.eventTypes.walima, icon: "walima" },
  aqiqah: { label: t.eventTypes.aqiqah, icon: "baby" },
  khatna: { label: t.eventTypes.khatna, icon: "star" },
  birthday: { label: t.eventTypes.birthday, icon: "cake" },
  other: { label: t.eventTypes.other, icon: "other" },
} as const satisfies Record<string, { label: string; icon: IconName }>

export type EventType = keyof typeof EVENT_TYPES
export const EVENT_TYPE_KEYS = Object.keys(EVENT_TYPES) as [EventType, ...EventType[]]
export const eventType = (key: string) => EVENT_TYPES[key as EventType] ?? EVENT_TYPES.other

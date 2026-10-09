import type { IconName } from "./icons.ts"

// ধরন যোগ/বদল শুধু এখানে
export const EVENT_TYPES = {
  wedding: { label: "বিয়ে", icon: "wedding" },
  holud: { label: "গায়ে হলুদ", icon: "holud" },
  walima: { label: "বউভাত", icon: "walima" },
  aqiqah: { label: "আকিকা", icon: "baby" },
  khatna: { label: "খতনা", icon: "star" },
  birthday: { label: "জন্মদিন", icon: "cake" },
  other: { label: "অন্যান্য", icon: "other" },
} as const satisfies Record<string, { label: string; icon: IconName }>

export type EventType = keyof typeof EVENT_TYPES
export const EVENT_TYPE_KEYS = Object.keys(EVENT_TYPES) as [EventType, ...EventType[]]
export const eventType = (key: string) => EVENT_TYPES[key as EventType] ?? EVENT_TYPES.other

import type { IconName } from "./icons"

export const NAV_ITEMS = [
  { path: "/events", icon: "home", key: "home" },
  { path: "/people", icon: "people", key: "people" },
  { path: "/share", icon: "share", key: "share" },
  { path: "/settings", icon: "settings", key: "settings" },
] as const satisfies ReadonlyArray<{ path: string; icon: IconName; key: "home" | "people" | "share" | "settings" }>

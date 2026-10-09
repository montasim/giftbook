import { Link, type LinkProps } from "@tanstack/react-router"
import { Fragment } from "react"
import { AppIcon } from "./app-icon"

export type Crumb = { label: string; to?: LinkProps["to"]; params?: Record<string, string> }

// প্রতিটা পাতার উপরে: অনুষ্ঠান › সাকিবের বিয়ে
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="breadcrumb" className="mb-2 flex flex-wrap items-center gap-1 text-sm text-stone-500">
      {items.map((c, i) => (
        <Fragment key={i}>
          {i > 0 && <AppIcon name="chevronRight" size={12} className="text-stone-400" />}
          {c.to && i < items.length - 1 ? (
            <Link to={c.to} params={c.params as never} className="rounded hover:text-stone-900 hover:underline">
              {c.label}
            </Link>
          ) : (
            <span className={i === items.length - 1 ? "truncate font-medium text-stone-900" : undefined} aria-current={i === items.length - 1 ? "page" : undefined}>
              {c.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  )
}

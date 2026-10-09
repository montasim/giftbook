import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

// প্রতিটা পাতার কাঠামো নকল করা স্কেলেটন — ডাটা আসার আগে (Dexie প্রথম লোড / রুট বদল)
const Line = ({ w = "w-24", h = "h-4", className = "" }: { w?: string; h?: string; className?: string }) => <Skeleton className={`${h} ${w} rounded-md ${className}`} />
const StatSk = () => (
  <Card className="flex flex-col gap-2 p-3">
    <Line w="w-20" h="h-3" />
    <Line w="w-28" h="h-6" />
  </Card>
)
const HeaderSk = ({ action = true, sub = true }: { action?: boolean; sub?: boolean }) => (
  <div className="mb-4 flex items-start justify-between gap-3 lg:mb-6">
    <div className="flex flex-col gap-2">
      <Line w="w-40" h="h-7" />
      {sub && <Line w="w-56" h="h-4" />}
    </div>
    {action && <Line w="w-32" h="h-11" className="rounded-lg" />}
  </div>
)
const EventCardSk = () => (
  <Card className="flex flex-row gap-3 p-4">
    <Skeleton className="h-11 w-11 rounded-xl" />
    <div className="flex flex-1 flex-col gap-2">
      <Line w="w-40" h="h-5" />
      <Line w="w-56" h="h-3.5" />
      <div className="mt-1 flex gap-4">
        <Line w="w-20" h="h-3.5" />
        <Line w="w-20" h="h-3.5" />
        <Line w="w-16" h="h-3.5" />
      </div>
    </div>
  </Card>
)
const TableSk = ({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) => (
  <Card className="overflow-hidden p-0">
    <div className="hidden sm:block">
      <div className="flex gap-6 border-b border-stone-200 px-3 py-3">
        {Array.from({ length: cols }, (_, i) => <Line key={i} w={i === 0 ? "w-32" : "w-20"} h="h-3.5" />)}
      </div>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-6 border-b border-stone-100 px-3 py-3 last:border-0">
          <Line w="w-32" h="h-4" />
          <Skeleton className="h-5 w-16 rounded-full" />
          <Line w="w-20" h="h-4" />
          <Line w="w-24" h="h-4" />
          <Line w="w-28" h="h-4" />
        </div>
      ))}
    </div>
    <div className="divide-y divide-stone-100 sm:hidden">
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="flex items-center gap-3 px-4 py-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Line w="w-32" h="h-4" />
            <Line w="w-20" h="h-3" />
          </div>
          <Line w="w-16" h="h-4" />
        </div>
      ))}
    </div>
  </Card>
)
const PersonCardSk = () => (
  <Card className="flex flex-row items-center gap-3 p-3">
    <Skeleton className="h-10 w-10 rounded-full" />
    <div className="flex flex-1 flex-col gap-1.5">
      <Line w="w-32" h="h-4" />
      <Line w="w-44" h="h-3" />
    </div>
    <div className="flex flex-col items-end gap-1.5">
      <Line w="w-14" h="h-3.5" />
      <Line w="w-14" h="h-3.5" />
    </div>
  </Card>
)
const CardBlockSk = ({ lines = 3, button = true }: { lines?: number; button?: boolean }) => (
  <Card className="flex flex-col gap-3 p-4">
    <Line w="w-28" h="h-5" />
    {Array.from({ length: lines }, (_, i) => <Line key={i} w={i % 2 ? "w-3/4" : "w-full"} h="h-4" />)}
    {button && <div className="flex gap-2"><Line w="w-28" h="h-11" className="rounded-lg" /><Line w="w-28" h="h-11" className="rounded-lg" /></div>}
  </Card>
)

export const HomeSkeleton = () => (
  <div>
    <HeaderSk />
    <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4 lg:mb-6">{[0, 1, 2, 3].map((i) => <StatSk key={i} />)}</div>
    <div className="grid gap-3 md:grid-cols-2">{[0, 1, 2, 3].map((i) => <EventCardSk key={i} />)}</div>
  </div>
)
export const EventSkeleton = () => (
  <div className="flex flex-col gap-4">
    <HeaderSk />
    <div className="grid grid-cols-3 gap-2">{[0, 1, 2].map((i) => <StatSk key={i} />)}</div>
    <Skeleton className="h-10 w-full rounded-lg" />
    <TableSk />
  </div>
)
export const PeopleSkeleton = () => (
  <div>
    <HeaderSk sub={false} />
    <Skeleton className="mb-3 h-11 w-full rounded-lg" />
    <div className="grid gap-2 md:grid-cols-2">{[0, 1, 2, 3, 4, 5].map((i) => <PersonCardSk key={i} />)}</div>
  </div>
)
export const PersonSkeleton = () => (
  <div>
    <HeaderSk />
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[18rem_1fr] lg:items-start lg:gap-6">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">{[0, 1, 2].map((i) => <StatSk key={i} />)}</div>
        <Line w="w-44" h="h-11" className="rounded-lg" />
      </div>
      <TableSk rows={4} cols={4} />
    </div>
  </div>
)
export const ShareSkeleton = () => (
  <div>
    <HeaderSk action={false} sub={false} />
    <div className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:items-start lg:gap-6">
      <Card className="flex flex-col items-center gap-3 p-4">
        <Line w="w-24" h="h-5" className="self-start" />
        <Line w="w-full" h="h-4" />
        <Skeleton className="h-[200px] w-[200px] rounded-lg" />
        <div className="flex gap-2"><Line w="w-28" h="h-11" className="rounded-lg" /><Line w="w-24" h="h-11" className="rounded-lg" /></div>
      </Card>
      <div className="flex flex-col gap-4">
        <CardBlockSk lines={1} button={false} />
        <Card className="flex flex-col gap-3 p-4">
          <Line w="w-40" h="h-5" />
          {[0, 1].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex flex-1 flex-col gap-1.5"><Line w="w-24" h="h-3.5" /><Line w="w-40" h="h-3" /></div>
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          ))}
        </Card>
      </div>
    </div>
  </div>
)
export const SettingsSkeleton = () => (
  <div>
    <HeaderSk action={false} sub={false} />
    <div className="flex flex-col gap-4 md:flex-row md:items-start">
      <div className="flex flex-1 flex-col gap-4"><CardBlockSk lines={1} /><CardBlockSk lines={3} button={false} /></div>
      <div className="flex flex-1 flex-col gap-4"><CardBlockSk lines={2} /><CardBlockSk lines={1} /></div>
    </div>
  </div>
)
export const PrintSkeleton = () => (
  <div className="mx-auto max-w-3xl p-6">
    <HeaderSk />
    <TableSk rows={8} />
  </div>
)

export function PageSkeleton({ pathname }: { pathname: string }) {
  if (pathname.endsWith("/print")) return <PrintSkeleton />
  if (pathname.startsWith("/events/")) return <EventSkeleton />
  if (pathname === "/people") return <PeopleSkeleton />
  if (pathname.startsWith("/people/")) return <PersonSkeleton />
  if (pathname.startsWith("/share")) return <ShareSkeleton />
  if (pathname.startsWith("/settings")) return <SettingsSkeleton />
  return <HomeSkeleton />
}

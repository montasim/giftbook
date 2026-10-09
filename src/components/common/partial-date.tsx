import { formatPartialDate } from "@/lib/format"

export const PartialDate = ({ value, className }: { value: string; className?: string }) => (
  <time dateTime={value} className={className}>
    {formatPartialDate(value)}
  </time>
)

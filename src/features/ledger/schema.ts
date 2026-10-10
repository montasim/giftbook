import { z } from "zod"
import { EVENT_TYPE_KEYS } from "../../config/event-types.ts"
import { today } from "../../lib/format.ts"
import { t } from "../../lib/i18n/index.ts"

const meta = {
  id: z.string().min(1),
  updatedAt: z.string().min(1),
  updatedBy: z.string(),
  deletedAt: z.string().nullable(),
}

export const DATE_RE = /^\d{4}(-\d{2}(-\d{2})?)?$/

// ⚠️ শিটের কলামের ক্রম = key-এর ক্রম। নতুন ফিল্ড সবসময় শেষে।
export const eventSchema = z.object({
  ...meta,
  name: z.string().trim().min(1, t.common.required),
  type: z.enum(EVENT_TYPE_KEYS),
  date: z.string().regex(DATE_RE, t.event.invalidDate),
  location: z.string(),
  note: z.string(),
})
export const personSchema = z.object({
  ...meta,
  name: z.string().trim().min(1, t.common.required),
  phone: z.string(),
  address: z.string(),
  relation: z.string(),
  note: z.string(),
})
export const giftSchema = z.object({
  ...meta,
  eventId: z.string().min(1),
  personId: z.string().min(1),
  direction: z.enum(["received", "given"]),
  amount: z.number().int().nonnegative().nullable(),
  item: z.string(),
  note: z.string(),
})

export type LedgerEvent = z.infer<typeof eventSchema>
export type Person = z.infer<typeof personSchema>
export type Gift = z.infer<typeof giftSchema>
export type Direction = Gift["direction"]
export type Meta = { id: string; updatedAt: string; updatedBy: string; deletedAt: string | null }
export type EventInput = Omit<LedgerEvent, keyof Meta>
export type PersonInput = Omit<Person, keyof Meta>
export type GiftInput = Omit<Gift, keyof Meta>

export const TABLES = { events: eventSchema, people: personSchema, gifts: giftSchema } as const
export type TableName = keyof typeof TABLES
export const TABLE_NAMES = Object.keys(TABLES) as TableName[]
export const columnsOf = (table: TableName): string[] => Object.keys(TABLES[table].shape)

export const isPending = (g: Pick<Gift, "amount" | "item">) => g.amount === null && g.item.trim() === ""

// ফর্মের স্কিমা: meta ছাড়া
export const eventInputSchema = eventSchema.omit({ id: true, updatedAt: true, updatedBy: true, deletedAt: true })
export const personInputSchema = personSchema.omit({ id: true, updatedAt: true, updatedBy: true, deletedAt: true })

export const emptyEvent = (): EventInput => ({ name: "", type: "wedding", date: today(), location: "", note: "" })
export const emptyPerson = (): PersonInput => ({ name: "", phone: "", address: "", relation: "", note: "" })

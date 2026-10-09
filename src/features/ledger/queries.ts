import type { Gift, LedgerEvent, Person } from "./schema.ts"
import { isPending } from "./schema.ts"

// বিশুদ্ধ সিলেক্টর। deletedAt এখানেই বাদ, কম্পোনেন্টে না।
export type LedgerData = { events: LedgerEvent[]; people: Person[]; gifts: Gift[] }
export type GiftWithPerson = Gift & { person?: Person }
export type GiftWithEvent = Gift & { event: LedgerEvent }
export type Totals = { received: number; given: number; net: number; count: number; pending: number }

const live = <T extends { deletedAt: string | null }>(rows: T[]) => rows.filter((r) => !r.deletedAt)
const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name, "bn")

export const selectEvents = (db: LedgerData) => live(db.events).sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt))
export const selectEvent = (db: LedgerData, id: string) => live(db.events).find((e) => e.id === id) ?? null
export const selectPeople = (db: LedgerData) => live(db.people).sort(byName)
export const selectPerson = (db: LedgerData, id: string) => live(db.people).find((p) => p.id === id) ?? null
export const selectGifts = (db: LedgerData) => live(db.gifts)

const peopleMap = (db: LedgerData) => new Map(db.people.map((p) => [p.id, p]))
const eventMap = (db: LedgerData) => new Map(db.events.map((e) => [e.id, e]))

export const selectEventGifts = (db: LedgerData, eventId: string): GiftWithPerson[] => {
  const people = peopleMap(db)
  return live(db.gifts)
    .filter((g) => g.eventId === eventId)
    .map((g) => ({ ...g, person: people.get(g.personId) }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export const selectPersonHistory = (db: LedgerData, personId: string): GiftWithEvent[] => {
  const events = eventMap(db)
  return live(db.gifts)
    .filter((g) => g.personId === personId)
    .flatMap((g) => {
      const event = events.get(g.eventId)
      return event && !event.deletedAt ? [{ ...g, event }] : []
    })
    .sort((a, b) => b.event.date.localeCompare(a.event.date) || b.updatedAt.localeCompare(a.updatedAt))
}

export function totals(gifts: Gift[]): Totals {
  const acc = { received: 0, given: 0, count: gifts.length, pending: 0 }
  for (const g of gifts) {
    if (isPending(g)) acc.pending++
    if (g.amount) acc[g.direction] += g.amount
  }
  return { ...acc, net: acc.received - acc.given }
}

export const totalsByEvent = (db: LedgerData) => {
  const map = new Map<string, Gift[]>()
  for (const g of live(db.gifts)) map.set(g.eventId, [...(map.get(g.eventId) ?? []), g])
  return (eventId: string) => totals(map.get(eventId) ?? [])
}

export const totalsByPerson = (db: LedgerData) => {
  const events = eventMap(db)
  const map = new Map<string, Gift[]>()
  for (const g of live(db.gifts)) {
    const e = events.get(g.eventId)
    if (!e || e.deletedAt) continue
    map.set(g.personId, [...(map.get(g.personId) ?? []), g])
  }
  return (personId: string) => totals(map.get(personId) ?? [])
}

export const selectAllTotals = (db: LedgerData) => {
  const ids = new Set(selectEvents(db).map((e) => e.id))
  return totals(live(db.gifts).filter((g) => ids.has(g.eventId)))
}

export const findByPhone = (db: LedgerData, phone: string, exceptId?: string) =>
  phone ? (selectPeople(db).find((p) => p.phone === phone && p.id !== exceptId) ?? null) : null

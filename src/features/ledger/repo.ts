import type { LedgerDB } from "./db"
import type { EventInput, Gift, GiftInput, LedgerEvent, Person, PersonInput } from "./schema"

// লেখার একমাত্র দরজা: updatedAt / updatedBy কখনো বাদ পড়ে না
export function createRepo(db: LedgerDB, me: string, onWrite: () => void = () => {}) {
  const now = () => new Date().toISOString()
  const stamp = () => ({ updatedAt: now(), updatedBy: me })
  const fresh = () => ({ id: crypto.randomUUID(), deletedAt: null, ...stamp() })
  const done = <T>(p: Promise<T>) => p.then((r) => (onWrite(), r))

  const addEvent = (d: EventInput) => {
    const row: LedgerEvent = { ...d, ...fresh() }
    return done(db.events.add(row).then(() => row))
  }
  const addPerson = (d: PersonInput) => {
    const row: Person = { ...d, ...fresh() }
    return done(db.people.add(row).then(() => row))
  }
  const addGift = (d: GiftInput) => {
    const row: Gift = { ...d, ...fresh() }
    return done(db.gifts.add(row).then(() => row))
  }
  const updateEvent = (id: string, patch: Partial<EventInput>) => done(db.events.update(id, { ...patch, ...stamp() }))
  const updatePerson = (id: string, patch: Partial<PersonInput>) => done(db.people.update(id, { ...patch, ...stamp() }))
  const updateGift = (id: string, patch: Partial<GiftInput>) => done(db.gifts.update(id, { ...patch, ...stamp() }))
  const removeEvent = (id: string) => done(db.events.update(id, { deletedAt: now(), ...stamp() }))
  const removePerson = (id: string) => done(db.people.update(id, { deletedAt: now(), ...stamp() }))
  const removeGift = (id: string) => done(db.gifts.update(id, { deletedAt: now(), ...stamp() }))

  // dup-এর উপহার keep-এ; dup soft delete; keep-এর ফাঁকা ফিল্ডে dup-এর মান
  const mergePeople = (keepId: string, dupId: string) =>
    done(
      db.transaction("rw", db.gifts, db.people, async () => {
        const [keep, dup] = await Promise.all([db.people.get(keepId), db.people.get(dupId)])
        if (!keep || !dup) return
        await db.gifts.where("personId").equals(dupId).modify({ personId: keepId, ...stamp() })
        const fill: Partial<PersonInput> = {}
        for (const k of ["phone", "address", "relation", "note"] as const) if (!keep[k] && dup[k]) fill[k] = dup[k]
        await db.people.update(keepId, { ...fill, ...stamp() })
        await db.people.update(dupId, { deletedAt: now(), ...stamp() })
      })
    )

  const bulkAdd = (data: { events: LedgerEvent[]; people: Person[]; gifts: Gift[] }) =>
    done(
      db.transaction("rw", db.events, db.people, db.gifts, async () => {
        await db.events.bulkPut(data.events)
        await db.people.bulkPut(data.people)
        await db.gifts.bulkPut(data.gifts)
      })
    )

  return { addEvent, updateEvent, removeEvent, addPerson, updatePerson, removePerson, addGift, updateGift, removeGift, mergePeople, bulkAdd }
}
export type Repo = ReturnType<typeof createRepo>

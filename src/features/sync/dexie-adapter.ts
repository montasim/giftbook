import type { LedgerDB } from "@/features/ledger/db"
import type { CycleDb } from "./sync-cycle"

export const dexieAdapter = (db: LedgerDB): CycleDb => ({
  async getAll() {
    const [events, people, gifts] = await Promise.all([db.events.toArray(), db.people.toArray(), db.gifts.toArray()])
    return { events, people, gifts }
  },
  save: (toSave) =>
    db.transaction("rw", db.events, db.people, db.gifts, async () => {
      if (toSave.events) await db.events.bulkPut(toSave.events)
      if (toSave.people) await db.people.bulkPut(toSave.people)
      if (toSave.gifts) await db.gifts.bulkPut(toSave.gifts)
    }),
})

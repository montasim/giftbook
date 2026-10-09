import Dexie, { type Table } from "dexie"
import type { Gift, LedgerEvent, Person } from "./schema"

// প্রতিটা খাতার জন্য আলাদা DB
export class LedgerDB extends Dexie {
  events!: Table<LedgerEvent, string>
  people!: Table<Person, string>
  gifts!: Table<Gift, string>
  constructor(fileId: string) {
    super(`ledger-${fileId}`)
    this.version(1).stores({
      events: "id, date, updatedAt",
      people: "id, name, phone, updatedAt",
      gifts: "id, eventId, personId, updatedAt",
    })
  }
}

const cache = new Map<string, LedgerDB>()
export function openLedger(fileId: string): LedgerDB {
  let db = cache.get(fileId)
  if (!db) {
    db = new LedgerDB(fileId)
    cache.set(fileId, db)
  }
  return db
}

export async function deleteLedgerLocal(fileId: string) {
  localStorage.removeItem(`uk-file-${fileId}`)
  cache.get(fileId)?.close()
  cache.delete(fileId)
  await Dexie.delete(`ledger-${fileId}`)
}

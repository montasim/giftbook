import { useLiveQuery } from "dexie-react-hooks"
import type { LedgerDB } from "./db"
import type { LedgerData } from "./queries"

// ≈ useLiveQuery: ডাটা বদলালে (এই ট্যাবে বা অন্য ট্যাবে) সব স্ক্রিন নিজে আপডেট হয়
export function useLedgerData(db: LedgerDB): LedgerData | undefined {
  return useLiveQuery(
    async () => {
      const [events, people, gifts] = await Promise.all([db.events.toArray(), db.people.toArray(), db.gifts.toArray()])
      return { events, people, gifts }
    },
    [db]
  )
}

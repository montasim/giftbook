import type { Gift, LedgerEvent, Person } from "./schema"

export function seedData(me: string): { events: LedgerEvent[]; people: Person[]; gifts: Gift[] } {
  const stamp = (minutesAgo: number) => ({ id: crypto.randomUUID(), deletedAt: null, updatedBy: me, updatedAt: new Date(Date.now() - minutesAgo * 60000).toISOString() })
  const people: Person[] = [
    { name: "রহিম মামা", phone: "01711000001", address: "মিরপুর, ঢাকা", relation: "মামা", note: "" },
    { name: "করিম চাচা", phone: "01811000002", address: "কুমিল্লা", relation: "চাচা", note: "" },
    { name: "সালমা খালা", phone: "", address: "চট্টগ্রাম", relation: "খালা", note: "" },
    { name: "জামাল ভাই", phone: "01911000004", address: "উত্তরা", relation: "প্রতিবেশী", note: "" },
    { name: "রহিম", phone: "", address: "", relation: "", note: "মার্জ টেস্টের জন্য" },
  ].map((p, i) => ({ ...p, ...stamp(100 - i) }))
  const events: LedgerEvent[] = [
    { name: "সাকিবের বিয়ে", type: "wedding" as const, date: "2024-12-20", location: "ধানমন্ডি কমিউনিটি সেন্টার", note: "" },
    { name: "আয়ানের আকিকা", type: "aqiqah" as const, date: "2023-05", location: "বাসায়", note: "" },
    { name: "রহিম মামার মেয়ের বিয়ে", type: "wedding" as const, date: "2018", location: "মিরপুর", note: "পুরনো খাতা থেকে তোলা" },
  ].map((e, i) => ({ ...e, ...stamp(90 - i) }))
  const [rahimMama, karim, salma, jamal, rahim] = people as [Person, Person, Person, Person, Person]
  const [wedding, aqiqah, oldWedding] = events as [LedgerEvent, LedgerEvent, LedgerEvent]
  const gifts: Gift[] = [
    { eventId: wedding.id, personId: rahimMama.id, direction: "received" as const, amount: 5000, item: "", note: "" },
    { eventId: wedding.id, personId: karim.id, direction: "received" as const, amount: 2000, item: "শাড়ি", note: "" },
    { eventId: wedding.id, personId: salma.id, direction: "received" as const, amount: null, item: "২ আনা সোনার আংটি", note: "" },
    { eventId: wedding.id, personId: jamal.id, direction: "received" as const, amount: null, item: "", note: "" },
    { eventId: wedding.id, personId: rahim.id, direction: "received" as const, amount: 1000, item: "", note: "" },
    { eventId: aqiqah.id, personId: rahimMama.id, direction: "received" as const, amount: 1000, item: "", note: "" },
    { eventId: aqiqah.id, personId: jamal.id, direction: "received" as const, amount: 500, item: "জামা", note: "" },
    { eventId: oldWedding.id, personId: rahimMama.id, direction: "given" as const, amount: 3000, item: "", note: "" },
  ].map((g, i) => ({ ...g, ...stamp(60 - i) }))
  return { people, events, gifts }
}

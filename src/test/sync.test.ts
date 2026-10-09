import { test } from "node:test"
import assert from "node:assert/strict"
import { toRow, fromRow, assertHeaders } from "../features/sync/rows.ts"
import { merge } from "../features/sync/merge.ts"
import { createMockSheets, type KV } from "../features/google/mock/sheets.ts"
import { syncOnce, type CycleDb } from "../features/sync/sync-cycle.ts"
import { COLUMNS_TEST as COLUMNS } from "./columns.ts"
import type { Gift } from "../features/ledger/schema.ts"
import type { LedgerData } from "../features/ledger/queries.ts"

const memStorage = (): KV => {
  const m = new Map<string, string>()
  return { get: (k) => m.get(k) ?? null, set: (k, v) => void m.set(k, v) }
}
const memDb = (init: LedgerData = { events: [], people: [], gifts: [] }): CycleDb & { data: () => LedgerData } => {
  let s = init
  return {
    data: () => s,
    getAll: async () => s,
    save: async (toSave) => {
      for (const t of ["events", "people", "gifts"] as const) {
        const rows = toSave[t] as { id: string }[] | undefined
        if (!rows) continue
        const byId = new Map((s[t] as { id: string }[]).map((r) => [r.id, r]))
        for (const r of rows) byId.set(r.id, r)
        s = { ...s, [t]: [...byId.values()] }
      }
    },
  }
}
const gift = (o: Partial<Gift> = {}): Gift => ({ id: "g1", updatedAt: "2026-01-01T00:00:00.000Z", updatedBy: "a@x", deletedAt: null, eventId: "e1", personId: "p1", direction: "received", amount: 500, item: "", note: "", ...o })
const giftsOf = (api: ReturnType<typeof createMockSheets>, f: string) => api.batchGet(f).then((r) => r.valueRanges[2]?.values ?? [])

test("rows: toRow/fromRow রাউন্ডট্রিপ, '' → null", () => {
  const g = gift({ amount: null, item: "শাড়ি" })
  const row = toRow("gifts", g)
  assert.equal(row.length, COLUMNS.gifts.length)
  assert.equal(row[COLUMNS.gifts.indexOf("amount")], "")
  assert.deepEqual(fromRow("gifts", row), { ok: true, value: g })
})

test("rows: ভুল সারি বাদ", () => {
  assert.equal(fromRow("gifts", toRow("gifts", { ...gift(), direction: "bogus" })).ok, false)
  assert.equal(fromRow("events", ["", "2026-01-01T00:00:00.000Z", "a", "", "x", "wedding", "2018"]).ok, false)
  assert.equal(fromRow("events", ["e1", "2026-01-01T00:00:00.000Z", "a", "", "x", "wedding", "18"]).ok, false)
})

test("rows: হেডার — কম/বদলানো কলাম ফেল, ডানে বাড়তি কলাম পাস", () => {
  assert.throws(() => assertHeaders("gifts", COLUMNS.gifts.slice(0, -1)), /sheet-tampered:gifts/)
  assert.throws(() => assertHeaders("people", [...COLUMNS.people].reverse()), /sheet-tampered/)
  assert.doesNotThrow(() => assertHeaders("gifts", [...COLUMNS.gifts, "আমার নোট"]))
})

test("merge: নতুন লোকাল → push; নতুন রিমোট → save; সমান → কিছু না; delete জেতে", () => {
  const l = [gift({ id: "a", updatedAt: "2026-01-02" }), gift({ id: "b", updatedAt: "2026-01-01" }), gift({ id: "c", updatedAt: "2026-01-01" })]
  const r = [gift({ id: "b", updatedAt: "2026-01-03", deletedAt: "2026-01-03" }), gift({ id: "c", updatedAt: "2026-01-01" }), gift({ id: "d", updatedAt: "2026-01-01" })]
  const { toPush, toSave } = merge(l, r)
  assert.deepEqual(toPush.map((x) => x.id), ["a"])
  assert.deepEqual(toSave.map((x) => x.id), ["b", "d"])
  assert.equal(toSave[0]?.deletedAt, "2026-01-03")
})

test("cycle: প্রথম চক্রে লোকাল সব append হয়, দ্বিতীয়তে কিছু না", async () => {
  const api = createMockSheets(memStorage())
  api.createSpreadsheet("f")
  const db = memDb({ events: [], people: [], gifts: [gift({ id: "g1" }), gift({ id: "g2" })] })
  const r1 = await syncOnce({ api, db, fileId: "f" })
  assert.equal(r1.appended, 2)
  const r2 = await syncOnce({ api, db, fileId: "f" })
  assert.deepEqual([r2.appended, r2.updated, r2.saved], [0, 0, 0])
  assert.equal((await giftsOf(api, "f")).length, 3)
})

test("cycle: দুই ডিভাইস, একই উপহার — পরের লেখাটা জেতে, সারি একটাই", async () => {
  const api = createMockSheets(memStorage())
  api.createSpreadsheet("f")
  const A = memDb({ events: [], people: [], gifts: [gift({ id: "g1", amount: 500, updatedAt: "2026-01-01T10:00:00Z", updatedBy: "A" })] })
  await syncOnce({ api, db: A, fileId: "f" })
  const B = memDb()
  await syncOnce({ api, db: B, fileId: "f" })
  assert.equal(B.data().gifts[0]?.amount, 500)
  await B.save({ gifts: [{ ...B.data().gifts[0], amount: 1000, updatedAt: "2026-01-01T10:05:00Z", updatedBy: "B" }] })
  await A.save({ gifts: [{ ...A.data().gifts[0], amount: 700, updatedAt: "2026-01-01T10:03:00Z", updatedBy: "A" }] })
  await syncOnce({ api, db: B, fileId: "f" })
  const rA = await syncOnce({ api, db: A, fileId: "f" })
  assert.equal(rA.updated + rA.appended, 0)
  assert.equal(A.data().gifts[0]?.amount, 1000)
  assert.equal(A.data().gifts[0]?.updatedBy, "B")
  assert.equal((await giftsOf(api, "f")).length, 2)
})

test("cycle: append শিটে লেগে গেল কিন্তু কল ব্যর্থ — পরের চক্রে ডুপ্লিকেট নয়", async () => {
  const api = createMockSheets(memStorage())
  api.createSpreadsheet("f")
  const flaky = { ...api, append: async (f: string, t: string, v: string[][]) => { await api.append(f, t, v); throw new Error("network") } }
  const db = memDb({ events: [], people: [], gifts: [gift({ id: "g1" })] })
  await assert.rejects(syncOnce({ api: flaky, db, fileId: "f" }))
  const r = await syncOnce({ api, db, fileId: "f" })
  assert.deepEqual([r.appended, r.updated], [0, 0])
  assert.equal((await giftsOf(api, "f")).length, 2)
})

test("cycle: শিটে ডুপ্লিকেট id থাকলে প্রথম সারিটাই আপডেট হয়", async () => {
  const api = createMockSheets(memStorage())
  api.createSpreadsheet("f")
  await api.append("f", "gifts", [toRow("gifts", gift({ id: "g1", amount: 1 })), toRow("gifts", gift({ id: "g1", amount: 2 }))])
  const db = memDb({ events: [], people: [], gifts: [gift({ id: "g1", amount: 9, updatedAt: "2027-01-01" })] })
  const r = await syncOnce({ api, db, fileId: "f" })
  assert.equal(r.updated, 1)
  const rows = await giftsOf(api, "f")
  assert.equal(rows[1]?.[COLUMNS.gifts.indexOf("amount")], "9")
  assert.equal(rows[2]?.[COLUMNS.gifts.indexOf("amount")], "2")
})

test("cycle: কলাম বদলালে sheet-tampered, কিছু লেখা হয় না", async () => {
  const st = memStorage()
  const api = createMockSheets(st, { tamper: true })
  api.createSpreadsheet("f")
  const db = memDb({ events: [], people: [], gifts: [gift({ id: "g1" })] })
  await assert.rejects(syncOnce({ api, db, fileId: "f" }), /sheet-tampered:gifts/)
  assert.equal((await giftsOf(createMockSheets(st), "f")).length, 1)
})

import { test } from "node:test"
import assert from "node:assert/strict"
import { pickLang } from "../lib/i18n/lang.ts"
import { bn } from "../lib/i18n/bn.ts"
import { en } from "../lib/i18n/en.ts"

test("pickLang: stored জেতে, নইলে navigator, নইলে en", () => {
  assert.equal(pickLang("en", "bn-BD"), "en")
  assert.equal(pickLang("bn", "en-US"), "bn")
  assert.equal(pickLang("xx", "bn-BD"), "bn") // অচেনা stored উপেক্ষা
  assert.equal(pickLang(null, "bn-BD"), "bn")
  assert.equal(pickLang(null, "bn"), "bn")
  assert.equal(pickLang(null, "en-US"), "en")
  assert.equal(pickLang(null, undefined), "en")
})

type Leaf = { path: string; kind: string; arity?: number }
const leaves = (o: unknown, path = ""): Leaf[] => {
  if (typeof o === "function") return [{ path, kind: "function", arity: o.length }]
  if (Array.isArray(o)) return [{ path, kind: "array" }]
  if (o && typeof o === "object") return Object.entries(o).flatMap(([k, v]) => leaves(v, path ? `${path}.${k}` : k))
  return [{ path, kind: typeof o }]
}
const strings = (o: unknown): string[] => {
  if (typeof o === "string") return [o]
  if (typeof o === "function") return [String((o as (...a: string[]) => string)("5", "5", "5"))]
  if (Array.isArray(o)) return o.flatMap(strings)
  if (o && typeof o === "object") return Object.values(o).flatMap(strings)
  return []
}

test("i18n: en-এর key/টাইপ/arity bn-এর সমান", () => {
  assert.deepEqual(leaves(en), leaves(bn))
})

test("i18n: en-এ বাংলা অক্ষর নেই (privacy.english ও lang.other বাদে), ফাঁকা নেই", () => {
  const { privacy, lang: _l, ...rest } = en // lang.other = অন্য ভাষার নাম তার নিজের লিপিতে, ইচ্ছাকৃত
  const { english: _e, ...privacyRest } = privacy
  const all = strings({ ...rest, privacy: privacyRest, landing: { ...rest.landing, demoRows: [] } }) // demoRows: ডেমো ডাটা, ফাঁকা item বৈধ
  assert.deepEqual(all.filter((s) => /[ঀ-৿]/.test(s)), [])
  assert.deepEqual(all.filter((s) => s.trim() === ""), [])
})

test("i18n: নতুন key দুই ভাষায়", () => {
  for (const d of [bn, en]) {
    assert.equal(d.months.length, 12)
    assert.equal(Object.keys(d.eventTypes).length, 7)
    assert.ok(d.lang.other && d.settings.language && d.time.justNow)
  }
  assert.equal(bn.lang.otherCode, "en"); assert.equal(en.lang.otherCode, "bn")
})

import { test } from "node:test"
import assert from "node:assert/strict"
import { digits, formatTaka, formatPartialDate, timeAgo } from "../lib/format.ts"

test("digits: bn বাংলা, en ASCII", () => {
  assert.equal(digits(1234, "bn"), "১২৩৪")
  assert.equal(digits(1234, "en"), "1234")
})
test("formatTaka: লাখ গ্রুপিং দুই ভাষায়, সংখ্যা ভাষামতো", () => {
  assert.equal(formatTaka(200000, "bn"), "৳২,০০,০০০")
  assert.equal(formatTaka(200000, "en"), "৳2,00,000")
  assert.equal(formatTaka(-500, "en"), "-৳500")
})
test("formatPartialDate: year/month/day দুই ভাষায়", () => {
  assert.equal(formatPartialDate("2018-03-12", "bn"), "১২ মার্চ ২০১৮")
  assert.equal(formatPartialDate("2018-03-12", "en"), "12 March 2018")
  assert.equal(formatPartialDate("2018-03", "en"), "March 2018")
  assert.equal(formatPartialDate("2018", "en"), "2018")
})
test("timeAgo: en", () => {
  const ago = (s: number) => new Date(Date.now() - s * 1000).toISOString()
  assert.equal(timeAgo(ago(10), "en"), "just now")
  assert.equal(timeAgo(ago(120), "en"), "2 min ago")
  assert.equal(timeAgo(ago(120), "bn"), "২ মিনিট আগে")
})

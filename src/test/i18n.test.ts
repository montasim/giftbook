import { test } from "node:test"
import assert from "node:assert/strict"
import { pickLang } from "../lib/i18n/lang.ts"

test("pickLang: stored জেতে, নইলে navigator, নইলে en", () => {
  assert.equal(pickLang("en", "bn-BD"), "en")
  assert.equal(pickLang("bn", "en-US"), "bn")
  assert.equal(pickLang("xx", "bn-BD"), "bn") // অচেনা stored উপেক্ষা
  assert.equal(pickLang(null, "bn-BD"), "bn")
  assert.equal(pickLang(null, "bn"), "bn")
  assert.equal(pickLang(null, "en-US"), "en")
  assert.equal(pickLang(null, undefined), "en")
})

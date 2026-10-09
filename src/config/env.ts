import { z } from "zod"

const schema = z.object({
  VITE_GOOGLE_CLIENT_ID: z.string().default(""),
  VITE_GOOGLE_API_KEY: z.string().default(""),
  VITE_GOOGLE_APP_ID: z.string().default(""),
  VITE_GOOGLE_MOCK: z.string().default(""),
  VITE_SITE_URL: z.string().default(""),
})

const parsed = schema.parse(import.meta.env)
export const env = {
  ...parsed,
  // ক্লায়েন্ট আইডি না থাকলে বা VITE_GOOGLE_MOCK=1 হলে Google-এর জায়গায় localStorage মক (ডেমো মোড)
  mock: parsed.VITE_GOOGLE_MOCK === "1" || parsed.VITE_GOOGLE_CLIENT_ID === "",
}

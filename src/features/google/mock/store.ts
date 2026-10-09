// মক Drive: localStorage-এ, ট্যাবের মধ্যে শেয়ার হয় (A/B টেস্ট)
export type MockFile = { id: string; name: string; owner: string; ownerName: string; members: Record<string, { role: "writer"; pickerRequired: boolean }> }
const KEY = "uk-drive"
export const readFiles = (): Record<string, MockFile> => {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}")
  } catch {
    return {}
  }
}
export const writeFiles = (files: Record<string, MockFile>) => localStorage.setItem(KEY, JSON.stringify(files))
export const PRESET_ACCOUNTS = [
  { email: "ma@gmail.com", name: "আম্মু" },
  { email: "baba@gmail.com", name: "আব্বু" },
  { email: "chacha@gmail.com", name: "চাচা" },
]
export const MOCK_USER_KEY = "uk-mock-user"

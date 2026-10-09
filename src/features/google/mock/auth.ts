import type { AuthApi, GoogleUser } from "../types"
import { MOCK_USER_KEY, PRESET_ACCOUNTS } from "./store"

// মক: "টোকেন" = বাছা অ্যাকাউন্টের ইমেইল। লগইন পাতা chooseMockAccount() দিয়ে বসায়।
export function chooseMockAccount(email: string) {
  const name = PRESET_ACCOUNTS.find((a) => a.email === email)?.name ?? email.split("@")[0] ?? email
  localStorage.setItem(MOCK_USER_KEY, JSON.stringify({ email, name }))
}
export const mockAuth: AuthApi = {
  currentToken: () => (typeof localStorage === "undefined" ? null : localStorage.getItem(MOCK_USER_KEY)),
  requestToken: async (hint) => {
    const cur = localStorage.getItem(MOCK_USER_KEY)
    if (cur) return cur
    if (hint) {
      chooseMockAccount(hint)
      return localStorage.getItem(MOCK_USER_KEY) ?? ""
    }
    throw new Error("mock-choose-account")
  },
  fetchUser: async (): Promise<GoogleUser> => JSON.parse(localStorage.getItem(MOCK_USER_KEY) ?? "null"),
  clear: () => localStorage.removeItem(MOCK_USER_KEY),
}

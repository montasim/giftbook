// নেভিগেশনের পর কোন ঘরে ফোকাস যাবে। যে কম্পোনেন্ট মাউন্ট হয়, সে takeFocus() দিয়ে দেখে।
let pending: string | null = null
export const requestFocus = (key: string) => {
  pending = key
}
export const takeFocus = (key: string) => {
  if (pending !== key) return false
  pending = null
  return true
}

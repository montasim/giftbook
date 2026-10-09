// বিশুদ্ধ: last-write-wins (updatedAt ISO string)। soft delete-ও একটা লেখা।
// ponytail: ডিভাইসের ঘড়ির ওপর নির্ভর করে; দরকার হলে ফিল্ড-ভিত্তিক মার্জ।
export function merge<T extends { id: string; updatedAt: string }>(local: T[], remote: T[]) {
  const remoteById = new Map(remote.map((r) => [r.id, r]))
  const toPush: T[] = []
  const toSave: T[] = []
  for (const l of local) {
    const r = remoteById.get(l.id)
    if (!r || l.updatedAt > r.updatedAt) toPush.push(l)
    else if (r.updatedAt > l.updatedAt) toSave.push(r)
    remoteById.delete(l.id)
  }
  toSave.push(...remoteById.values())
  return { toPush, toSave }
}

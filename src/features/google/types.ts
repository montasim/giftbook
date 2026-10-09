// Google-এর সাথে অ্যাপের পুরো সংযোগ এই ৪টা ইন্টারফেসে। real/ = আসল REST, mock/ = localStorage (ডেমো মোড)।
export type GoogleUser = { email: string; name: string }
export type LedgerFile = { id: string; name: string; owner: string; ownerName: string; ownedByMe: boolean }
export type Member = { permissionId: string; email: string; name?: string; role: "owner" | "writer" | "reader" }

export type AuthApi = {
  currentToken: () => string | null
  // ইউজারের চাপে ডাকতে হবে (পপআপ)। hint থাকলে নিঃশব্দ চেষ্টা।
  requestToken: (hint?: string) => Promise<string>
  fetchUser: () => Promise<GoogleUser>
  clear: () => void
}

export type DriveApi = {
  listLedgers: (me: string) => Promise<LedgerFile[]>
  createLedger: (me: string, meName: string, name: string) => Promise<LedgerFile>
  getFile: (fileId: string, me: string) => Promise<LedgerFile> // 403/404 → GoogleError
  renameLedger: (fileId: string, name: string) => Promise<void>
  addEditor: (fileId: string, email: string) => Promise<void>
  listMembers: (fileId: string) => Promise<Member[]>
  removeMember: (fileId: string, permissionId: string) => Promise<void>
}

export type BatchUpdateItem = { range: string; values: string[][] }
export type SheetsApi = {
  batchGet: (fileId: string) => Promise<{ valueRanges: { range: string; values?: string[][] }[] }>
  batchUpdate: (fileId: string, data: BatchUpdateItem[]) => Promise<unknown>
  append: (fileId: string, table: string, values: string[][]) => Promise<unknown>
}

export type PickerApi = {
  // fileId দিলে শুধু ওই ফাইল, null দিলে শেয়ার করা সব স্প্রেডশিট; বাছলে id, বাতিল/খালি হলে null
  pickSharedFile: (fileId: string | null, token: string, me: string) => Promise<string | null>
}

import { gfetch } from "../gfetch"
import type { AuthApi, DriveApi, LedgerFile, Member } from "../types"
import { TABLE_NAMES, columnsOf } from "@/features/ledger/schema"

const D = "https://www.googleapis.com/drive/v3"
const S = "https://sheets.googleapis.com/v4/spreadsheets"
const APP_PROPS = { app: "upohar-khata", schemaVersion: "1" }
type DriveFile = { id: string; name: string; ownedByMe: boolean; owners?: { displayName?: string; emailAddress?: string }[] }
const toLedger = (f: DriveFile, me: string): LedgerFile => ({
  id: f.id,
  name: f.name,
  ownedByMe: f.ownedByMe,
  owner: f.ownedByMe ? me : (f.owners?.[0]?.emailAddress ?? ""),
  ownerName: f.owners?.[0]?.displayName ?? "",
})

export function createRealDrive(auth: AuthApi): DriveApi {
  const tok = () => auth.currentToken()
  const fields = "id,name,ownedByMe,owners(displayName,emailAddress)"
  return {
    async listLedgers(me) {
      const q = encodeURIComponent("appProperties has { key='app' and value='upohar-khata' } and trashed=false")
      const r = await gfetch<{ files: DriveFile[] }>(tok(), `${D}/files?q=${q}&fields=files(${fields})`)
      return r.files.map((f) => toLedger(f, me))
    },
    async createLedger(me, meName, name) {
      const sheetsSpec = TABLE_NAMES.map((t) => ({
        properties: { title: t, gridProperties: { frozenRowCount: 1 } },
        data: [{ rowData: [{ values: columnsOf(t).map((v) => ({ userEnteredValue: { stringValue: v } })) }] }],
      }))
      const created = await gfetch<{ spreadsheetId: string }>(tok(), S, { method: "POST", body: JSON.stringify({ properties: { title: name }, sheets: sheetsSpec }) })
      await gfetch(tok(), `${D}/files/${created.spreadsheetId}`, { method: "PATCH", body: JSON.stringify({ appProperties: APP_PROPS }) })
      return { id: created.spreadsheetId, name, owner: me, ownerName: meName, ownedByMe: true }
    },
    async getFile(fileId, me) {
      const f = await gfetch<DriveFile>(tok(), `${D}/files/${fileId}?fields=${fields}`)
      return toLedger(f, me)
    },
    async renameLedger(fileId, name) {
      await gfetch(tok(), `${D}/files/${fileId}`, { method: "PATCH", body: JSON.stringify({ name }) })
    },
    async addEditor(fileId, email) {
      await gfetch(tok(), `${D}/files/${fileId}/permissions?sendNotificationEmail=true`, { method: "POST", body: JSON.stringify({ type: "user", role: "writer", emailAddress: email }) })
    },
    async listMembers(fileId) {
      const r = await gfetch<{ permissions: { id: string; emailAddress?: string; displayName?: string; role: string }[] }>(tok(), `${D}/files/${fileId}/permissions?fields=permissions(id,emailAddress,displayName,role)`)
      return r.permissions
        .filter((p) => p.emailAddress)
        .map((p): Member => ({ permissionId: p.id, email: (p.emailAddress ?? "").toLowerCase(), name: p.displayName, role: p.role === "owner" ? "owner" : p.role === "writer" ? "writer" : "reader" }))
    },
    async removeMember(fileId, permissionId) {
      await gfetch(tok(), `${D}/files/${fileId}/permissions/${permissionId}`, { method: "DELETE" })
    },
  }
}

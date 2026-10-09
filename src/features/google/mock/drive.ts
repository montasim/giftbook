import { GoogleError } from "../errors"
import type { DriveApi, LedgerFile, Member } from "../types"
import { readFiles, writeFiles, type MockFile } from "./store"
import { createMockSheets } from "./sheets"

const toLedger = (f: MockFile, me: string): LedgerFile => ({ id: f.id, name: f.name, owner: f.owner, ownerName: f.ownerName, ownedByMe: f.owner === me })
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// drive.file: নিজের বানানো ফাইল + Picker-এ একবার বাছা শেয়ার করা ফাইল
export const mockDrive: DriveApi = {
  async listLedgers(me) {
    await sleep(400)
    return Object.values(readFiles())
      .filter((f) => f.owner === me || (f.members[me] && !f.members[me]?.pickerRequired))
      .map((f) => toLedger(f, me))
  },
  async createLedger(me, meName, name) {
    const id = "f" + crypto.randomUUID().replace(/-/g, "").slice(0, 24)
    const file: MockFile = { id, name, owner: me, ownerName: meName, members: {} }
    writeFiles({ ...readFiles(), [id]: file })
    createMockSheets().createSpreadsheet(id)
    return toLedger(file, me)
  },
  async getFile(fileId, me) {
    const f = readFiles()[fileId]
    if (!f) throw new GoogleError(404, "not-found")
    const m = f.members[me]
    if (f.owner !== me && !(m && !m.pickerRequired)) throw new GoogleError(403, "forbidden")
    return toLedger(f, me)
  },
  async renameLedger(fileId, name) {
    const files = readFiles()
    const f = files[fileId]
    if (f) writeFiles({ ...files, [fileId]: { ...f, name } })
  },
  async addEditor(fileId, email) {
    const files = readFiles()
    const f = files[fileId]
    if (!f) throw new GoogleError(404, "not-found")
    writeFiles({ ...files, [fileId]: { ...f, members: { ...f.members, [email]: { role: "writer", pickerRequired: true } } } })
  },
  async listMembers(fileId) {
    const f = readFiles()[fileId]
    if (!f) return []
    const owner: Member = { permissionId: "owner", email: f.owner, name: f.ownerName, role: "owner" }
    return [owner, ...Object.entries(f.members).map(([email, m]): Member => ({ permissionId: email, email, role: m.role }))]
  },
  async removeMember(fileId, permissionId) {
    const files = readFiles()
    const f = files[fileId]
    if (!f) return
    const members = { ...f.members }
    delete members[permissionId]
    writeFiles({ ...files, [fileId]: { ...f, members } })
  },
}

export function grantPickerAccess(fileId: string, email: string) {
  const files = readFiles()
  const f = files[fileId]
  const m = f?.members[email]
  if (!f || !m) return false
  writeFiles({ ...files, [fileId]: { ...f, members: { ...f.members, [email]: { ...m, pickerRequired: false } } } })
  return true
}
export const mockFileVisibleTo = (fileId: string, email: string): MockFile | null => {
  const f = readFiles()[fileId]
  return f && f.members[email] ? f : null
}

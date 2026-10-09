import { gfetch } from "../gfetch"
import type { AuthApi, SheetsApi } from "../types"
import { TABLE_NAMES } from "@/features/ledger/schema"

const S = "https://sheets.googleapis.com/v4/spreadsheets"

export function createRealSheets(auth: AuthApi): SheetsApi {
  const tok = () => auth.currentToken()
  return {
    batchGet(fileId) {
      const ranges = TABLE_NAMES.map((t) => `ranges=${encodeURIComponent(`${t}!A:Z`)}`).join("&")
      return gfetch(tok(), `${S}/${fileId}/values:batchGet?${ranges}&majorDimension=ROWS`)
    },
    batchUpdate(fileId, data) {
      return gfetch(tok(), `${S}/${fileId}/values:batchUpdate`, { method: "POST", body: JSON.stringify({ valueInputOption: "RAW", data }) })
    },
    append(fileId, table, values) {
      return gfetch(tok(), `${S}/${fileId}/values/${encodeURIComponent(`${table}!A:Z`)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`, { method: "POST", body: JSON.stringify({ values }) })
    },
  }
}

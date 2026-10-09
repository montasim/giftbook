import { env } from "@/config/env"
import type { PickerApi } from "../types"

let loaded: Promise<void> | null = null
const loadPicker = () => (loaded ??= new Promise<void>((res, rej) => (typeof gapi !== "undefined" ? gapi.load("picker", () => res()) : rej(new Error("gapi-not-loaded")))))

export const realPicker: PickerApi = {
  async pickSharedFile(fileId, token) {
    await loadPicker()
    return new Promise((resolve) => {
      const view = new google.picker.DocsView(google.picker.ViewId.SPREADSHEETS)
      if (fileId) view.setFileIds(fileId)
      new google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(token)
        .setDeveloperKey(env.VITE_GOOGLE_API_KEY)
        .setAppId(env.VITE_GOOGLE_APP_ID) // এটা ছাড়া drive.file অনুমতি মিলবে না
        .setLocale("bn")
        .setCallback((d: google.picker.ResponseObject) => {
          if (d.action === google.picker.Action.PICKED) resolve(d.docs?.[0]?.id ?? null)
          if (d.action === google.picker.Action.CANCEL) resolve(null)
        })
        .build()
        .setVisible(true)
    })
  },
}

import { env } from "@/config/env"
import type { AuthApi, DriveApi, PickerApi, SheetsApi } from "./types"
import { mockAuth } from "./mock/auth"
import { mockDrive } from "./mock/drive"
import { createMockSheets } from "./mock/sheets"
import { mockPicker } from "./mock/picker"
import { realAuth } from "./real/auth"
import { createRealDrive } from "./real/drive"
import { createRealSheets } from "./real/sheets"
import { realPicker } from "./real/picker"

export const isMock = env.mock
export const auth: AuthApi = isMock ? mockAuth : realAuth
export const drive: DriveApi = isMock ? mockDrive : createRealDrive(realAuth)
export const sheets: SheetsApi = isMock ? createMockSheets() : createRealSheets(realAuth)
export const picker: PickerApi = isMock ? mockPicker : realPicker
export { GoogleError } from "./errors"
export type * from "./types"

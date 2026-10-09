import { columnsOf } from "../features/ledger/schema.ts"

export const COLUMNS_TEST = { events: columnsOf("events"), people: columnsOf("people"), gifts: columnsOf("gifts") }

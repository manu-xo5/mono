import type { DataConnection, MediaConnection } from "peerjs"
import type { StoreApi } from "zustand"
import { create } from "zustand"

export const useCallStore = create(() => ({
    status: "idle" as
    | "idle"
    | "incoming-call"
    | "outgoing-call"
    | "ongoing-call"
    | "call-failed",
    dataConn: null as null | DataConnection,
    mediaConn: null as null | MediaConnection,
    abortCall: null as null | (() => void),
}))

export type ThunkFn<Store extends StoreApi<any>> = (set: Store["setState"], get: ReturnType<Store["getState"]>) => void

export function dispatchCallAction(thunk: ThunkFn<typeof useCallStore>) {
    thunk(useCallStore.setState, useCallStore.getState())
}

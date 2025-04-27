import type { useCallStore } from "@/store"
import type { ThunkFn } from "@/store/call-store"
import type { DataConnection, Peer } from "peerjs"
import { CALL_RESPONSE_TIMEOUT } from "@/constants"
import { dispatchCallAction } from "@/store/call-store"

type CallResponse = "accepted" | "rejected"

async function waitForCallResponse(
    conn: DataConnection,
    { signal }: { signal?: AbortSignal } = {},
) {
    const { promise, resolve } = Promise.withResolvers<CallResponse>()
    function cleanup() {
        signal?.removeEventListener("abort", handleAbort)
        conn.off("data", handleDataEvent)
    }

    function handleDataEvent(data: unknown) {
        if (data === "accepted" || data === "rejected") {
            resolve(data)
            cleanup()
        }
    }

    function handleAbort() {
        resolve("rejected")
        cleanup()
    }

    signal?.addEventListener("abort", handleAbort)
    conn.on("data", handleDataEvent)

    const res = await promise
    return res
}

export function makeRequest(peer: Peer, otherPeerId: string): ThunkFn<typeof useCallStore> {
    return async (setState, _state) => {
        const endCall = (status: typeof _state["status"], conn?: DataConnection) => {
            conn?.close()
            return ({
                status,
                dataConn: null,
                mediaConn: null,
                abortCall: null,
            })
        }

        const conn = peer.connect(otherPeerId, { metadata: { type: "call" } })
        const abortController = new AbortController()
        const signal = abortController.signal
        setState({
            status: "outgoing-call",
            dataConn: conn,
            abortCall: () => abortController.abort(),
        })

        console.debug("awaiting conn open")
        conn.once("open", async () => {
            console.debug("conn opened")
            const callResponse = await waitForCallResponse(conn, { signal: AbortSignal.any([signal, AbortSignal.timeout(CALL_RESPONSE_TIMEOUT)]) })
            console.debug("conn settled with", callResponse)

            if (callResponse === "rejected") {
                setState(endCall("idle", conn))
            }
            else {
                setState({
                    status: "ongoing-call",
                    dataConn: conn,
                    abortCall: null,
                })
            }
        })
    }
}

export function incomingCall(dataConn: DataConnection): ThunkFn<typeof useCallStore> {
    return async (setState, state) => {
        dataConn.once("open", () => {
            if (dataConn.metadata.type !== "call") {
                dataConn.close()
                return
            }

            if (!(state.status === "idle" || state.status === "ongoing-call")) {
                dataConn.send("rejected")
                dataConn.close()
                return
            }

            setState({ status: "incoming-call", dataConn })

            const missedCallTimer = window.setTimeout(() => {
                dispatchCallAction(missedCall(dataConn))
            }, CALL_RESPONSE_TIMEOUT)

            dataConn.on("data", (data) => {
                if (data === "end")
                    dispatchCallAction(endCall(dataConn, missedCallTimer))
            })
        })
    }
}

export function missedCall(dataConn: DataConnection): ThunkFn<typeof useCallStore> {
    return (setState, state) => {
        if (state.status === "incoming-call" && state.dataConn === dataConn) {
            console.debug("missed call", dataConn.peer)
            dataConn.close()
            setState({ status: "idle", dataConn: null, mediaConn: null })
        }
    }
}

export function endCall(dataConn: DataConnection, timer: number): ThunkFn<typeof useCallStore> {
    return (setState, state) => {
        dataConn.close()

        if (state.dataConn === dataConn) {
            console.debug("ended call", dataConn.peer)
            clearTimeout(timer)
            setState({ status: "idle", dataConn: null, mediaConn: null })
        }
    }
}

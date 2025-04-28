import type { Peer } from "peerjs"
import { CALL_RESPONSE_TIMEOUT } from "@/constants"
import { onAbort, sleepWith } from "@/lib/effection/utils"
import * as PeerX from "@/lib/peer"
import { useCallStore } from "@/store"
import { action, race, sleep } from "effection"

const setState = useCallStore.setState

export function* makeRequest(peer: Peer, otherPeerId: string) {
    const conn = peer.connect(otherPeerId, { metadata: { type: "call" } })
    const ac = new AbortController()

    setState({
        status: "outgoing-call",
        abortCall: () => ac.abort(),
        dataConn: conn,
    })

    const hasOpen = yield* race([PeerX.dataConnectionOnce(conn, "open"), sleep(2000), onAbort(ac.signal)])

    if (!hasOpen) {
        conn.close()
        setState({ status: "call-failed" })
        yield* sleep(1000)
        setState({ status: "idle" })
        return
    }

    const waitForResponse = action<"accepted" | "rejected">((resolve) => {
        const handleData = (data: unknown) => {
            if (data === "rejected" || data === "accepted")
                resolve(data)
        }
        conn.on("data", handleData)

        return () => conn.off("data", handleData)
    })

    const response = yield* race([
        waitForResponse,
        sleepWith(CALL_RESPONSE_TIMEOUT, "rejected"),
        onAbort(ac.signal),
    ])

    if (!response) {
        conn.close()
        setState({ status: "call-failed" })
        yield* sleep(1000)
        setState({ status: "idle" })
        return
    }

    if (response === "rejected") {
        conn.close()
        setState({ status: "request-rejected" })
        yield* sleep(1000)
        setState({ status: "idle" })
        return
    }

    setState({ status: "ongoing-call", dataConn: conn })
}

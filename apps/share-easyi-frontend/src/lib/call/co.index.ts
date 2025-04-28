import type { Peer } from "peerjs"
import { CALL_RESPONSE_TIMEOUT } from "@/constants"
import { useCallStore } from "@/store"
import { action, race, sleep } from "effection"
import { onAbort } from "../effection/utils"

const setState = useCallStore.setState

export function* makeRequest(peer: Peer, otherPeerId: string) {
    const conn = peer.connect(otherPeerId, { metadata: { type: "call" } })

    const ac = new AbortController()
    setState({
        status: "outgoing-call",
        abortCall: () => ac.abort(),
        dataConn: conn,
    })

    console.debug("awaiting conn open")
    const waitTillOpen = action<boolean>((resolve) => {
        const handleOpen = () => {
            resolve(true)
        }
        conn.on("open", handleOpen)
        return () => void conn.off("open", handleOpen)
    })

    const hasOpen = yield* race([waitTillOpen, sleep(2000), onAbort(ac.signal)])
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

    const response = yield* race([waitForResponse, onAbort(ac.signal), sleep(CALL_RESPONSE_TIMEOUT)])

    if (!response || response === "rejected") {
        conn.close()
        setState({ status: "idle" })
        return
    }

    setState({ status: "ongoing-call", dataConn: conn })
}

import type { DataConnection } from "peerjs"
import Peer from "peerjs"

const UUID_LEN = 36

export function createPeerId(name: string) {
    return crypto.randomUUID() + name
}

export function extractPeerName(peerId: string) {
    return peerId.substring(UUID_LEN)
}

export function getPeerIdFromStorage() {
    const peerId = localStorage.getItem("share-easyi")

    if (!peerId) {
        const newPeerId = createPeerId("no-name")
        localStorage.setItem("share-easyi", newPeerId)
        return newPeerId
    }

    return peerId
}

export function createPeer(peerId: string, handlers: { onConnection?: (conn: DataConnection) => void } = {}) {
    const peer = new Peer(peerId)

    peer.on("connection", (conn) => {
        console.debug("connected")
        handlers.onConnection?.(conn)
    })
    peer.on("close", () => console.debug("closed peer"))
    peer.on("error", err => console.debug("error", err))
    peer.on("disconnected", () => peer.reconnect())

    peer.on("open", () => console.debug("opened peer"))

    return peer
}

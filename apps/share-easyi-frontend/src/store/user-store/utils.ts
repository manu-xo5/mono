import * as call from "@/lib/call/index"
import * as PeerX from "@/lib/peer/index"
import { useUserStore } from "@/store/user-store/index"
import { dispatchCallAction } from "../call-store"

export function ensurePeer() {
    if (useUserStore.getState().peer) {
        return useUserStore.getState().peer
    }

    const newPeer = PeerX.createPeer(PeerX.getPeerIdFromStorage(), {
        onConnection: conn => dispatchCallAction(call.incomingCall(conn)),
    })

    useUserStore.setState({
        peer: newPeer,
    })

    return newPeer
}

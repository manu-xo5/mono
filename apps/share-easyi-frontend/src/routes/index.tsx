import { Button } from "@/components/ui/button"
import * as call from "@/lib/call/index"
import { useCallStore } from "@/store"
import { dispatchCallAction } from "@/store/call-store"
import { useUserStore } from "@/store/user-store"
import { ensurePeer } from "@/store/user-store/utils"
import { createFileRoute } from "@tanstack/react-router"
import { CopyIcon, RefreshCwIcon } from "lucide-react"
import { useState } from "react"

// setInterval(() => { console.debug("open connections", peer.connections) }, 5000);

export const Route = createFileRoute("/")({
    beforeLoad: () => ensurePeer(),
    component: App,
})

function App() {
    const [otherPeerId, _setOtherPeerId] = useState(() => localStorage.getItem("share-easyi:other") ?? "")
    const setOtherPeerId = (value: string) => {
        localStorage.setItem("share-easyi:other", value)
        _setOtherPeerId(value)
    }
    const peer = useUserStore(s => s.peer)!

    return (
        <>
            <div className="pt-12 h-svh">
                <div className="max-w-sm bg-card text-secondary-foreground p-6 m-3 rounded-md inline-block">
                    <div className="flex items-center text-muted-foreground p-3 pt-0 gap-3">
                        <p className="flex-1 min-w-0 truncate">{peer.id}</p>

                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() => navigator.clipboard.writeText(peer.id)}
                        >
                            <CopyIcon />
                        </Button>

                        <Button
                            size="icon"
                            variant="outline"
                            onClick={() => {
                                localStorage.setItem("share-easyi", "")
                                window.location.reload()
                            }}
                        >
                            <RefreshCwIcon />
                        </Button>
                    </div>

                    <div className="flex gap-3">
                        <input
                            placeholder="other peer id"
                            className="px-3 py-1 border-input border rounded-md flex-1 w-full"
                            value={otherPeerId}
                            onChange={ev => setOtherPeerId(ev.currentTarget.value)}
                        />

                        <Button
                            variant="outline"
                            onClick={async () => {
                                if (!otherPeerId) {
                                    console.error("other peer id is 'null'")
                                    return
                                }

                                if (useCallStore.getState().status !== "idle") {
                                    return
                                }

                                dispatchCallAction(call.makeRequest(peer, otherPeerId))
                            }}
                        >
                            Make Call
                        </Button>
                    </div>
                </div>
            </div>
        </>
    )
}

import type { DataConnection } from "peerjs"
import { action } from "effection"

// operations for effection
//

type DataConnectionEvents = "data" | "open"

export function* dataConnectionOnce(target: DataConnection, event: DataConnectionEvents) {
    const operation = action<void>((k) => {
        const handler = () => k()
        target.on(event, handler)

        return () => target.off(event, handler)
    })

    return operation
}

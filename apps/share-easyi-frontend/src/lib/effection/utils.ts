import type { Operation } from "effection"
import { action, sleep } from "effection"

export function onAbort(signal: AbortSignal) {
    const operator = action<void>((k) => {
        const handleAbort = () => k()
        signal.addEventListener("abort", handleAbort)

        if (signal.aborted)
            k()

        return () => void signal.removeEventListener("abort", handleAbort)
    })

    return operator
}

export function* sleepWith<Value>(duration: number, value: Value): Operation<Value> {
    yield* sleep(duration)
    return value
}

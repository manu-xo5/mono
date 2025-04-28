import { action } from "effection"

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

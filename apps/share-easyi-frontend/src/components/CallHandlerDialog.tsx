import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import * as formatTime from "@/format/time-string"
import * as callCo from "@/lib/call/co.index"
import { useCallStore } from "@/store"
import { PhoneIcon, PhoneOffIcon, XIcon } from "lucide-react"

export function OutgoingCall() {
    const callStatus = useCallStore(s => s.status)
    const dataConn = useCallStore(s => s.dataConn)
    const abortCall = useCallStore(s => s.abortCall)

    const incomingCallBtns = (
        <>
            <Button
                size="icon"
                className="rounded-full"
                variant="default"
                onClick={() => {
                    dataConn?.send("accepted")
                    dataConn?.on("close", () => {})
                    callCo.startCallTimer()
                    useCallStore.setState({
                        status: "ongoing-call",
                    })
                }}
            >
                <PhoneIcon />
            </Button>

            <Button
                size="icon"
                className="rounded-full -scale-x-100"
                variant="destructive"
                onClick={() => {
                    dataConn?.send("rejected")
                    dataConn?.close()

                    useCallStore.setState({
                        status: "idle",
                        dataConn: null,
                        mediaConn: null,
                    })
                }}
            >
                <PhoneOffIcon />
            </Button>
        </>
    )

    const ongoingCallBtns = (
        <Button
            size="icon"
            className="rounded-full"
            variant="destructive"
            onClick={() => {
                clearInterval(useCallStore.getState().callDuration.timerId)
                dataConn?.send("end")
                dataConn?.close()
                abortCall?.()

                useCallStore.setState({
                    dataConn: null,
                    mediaConn: null,
                    status: "idle",
                    callDuration: {
                        timerId: 0,
                        elapsedSeconds: 0,
                    },
                })
            }}
        >
            <PhoneOffIcon />
        </Button>
    )

    const callFailedBtns = (
        <Button
            size="icon"
            className="rounded-full"
            variant="secondary"
            disabled
        >
            <XIcon />
        </Button>
    )

    const btnsByCallStatus = callStatus === "incoming-call"
        ? (incomingCallBtns)
        : callStatus === "outgoing-call" || callStatus === "ongoing-call"
            ? (ongoingCallBtns)
            : callStatus === "call-failed" || callStatus === "request-rejected"
                ? (callFailedBtns)
                : null

    const TITLE_MAP: Record<typeof callStatus, React.ReactNode> = {
        "outgoing-call": "Calling...",
        "incoming-call": "Ringing...",
        "ongoing-call": <CallDuration />,
        "request-rejected": "Busy",
        "call-failed": "Call Failed",
        "idle": "Standby",
    }

    return (
        <Dialog open={callStatus !== "idle"}>
            <DialogContent className="w-sm flex flex-col gap-12 items-center">
                <DialogTitle>
                    {TITLE_MAP[callStatus]}
                </DialogTitle>

                <div className="inline-flex flex-col items-center pb-20">
                    <div className="bg-muted-foreground text-primary-foreground rounded-full size-20 grid place-items-center font-bold text-2xl">
                        UN
                    </div>
                    <p className="text-2xl">
                        Unknown
                    </p>
                </div>

                <div className="flex justify-evenly w-full">
                    {btnsByCallStatus}
                </div>

            </DialogContent>
        </Dialog>

    )
}

function CallDuration() {
    const elapsedSeconds = useCallStore(s => s.callDuration.elapsedSeconds)

    return (
        <span>
            On Call -
            <span className="tabular-nums">{(formatTime.fromSeconds(elapsedSeconds))}</span>
        </span>
    )
}

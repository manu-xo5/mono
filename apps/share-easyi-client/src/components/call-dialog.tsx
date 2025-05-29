import { callStatus, setCallStore, type CallStatus } from '@/call-service/store'
import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'
import { CallRipple } from './call-ripples'
import { Flexbox } from './ui/flex'
import { Icons } from './icons'
import { CallPeer } from '@/call-service/peer'

const STATUS_TO_TEXT = {
  idle: '',
  loading: 'Calling...',
  rejected: 'Busy',
  accepted: 'On Call',
  'peer-offline': 'Offline',
  failed: 'Call Failed',
} satisfies Record<CallStatus, string>

export function CallDialog() {
  const header = () => STATUS_TO_TEXT[callStatus()]

  return (
    <dialog
      open={true}
      class="absolute left-1/2 top-1/2 -translate-1/2 z-10 bg-secondary text-secondary-foreground rounded-xl h-96 w-72 border shadow-xl"
    >
      <Stack class="items-center p-4 gap-6 h-full">
        <p class="text-xl xanimate-bounce animate-pulse">{header()}</p>

        <div class="size-20 bg-black rounded-full border relative">
          <CallRipple />

          <img
            class="rounded-full z-20 absolute"
            src="https://lh3.googleusercontent.com/a/ACg8ocKESAosQC7kUMUPSlLmdIUPokPgTBr-tbSAeTkqIFWBcadrw9u6=s96-c"
            referrerPolicy="no-referrer"
          />
        </div>

        <Flexbox class="justify-around w-full mt-auto py-10">
          <Button
            variant="default"
            size="icon"
            class="rounded-full"
            onClick={() => {
              setCallStore((prev) => ({
                ...prev,
                status: 'idle',
              }))
            }}
          >
            <Icons.Phone />
          </Button>

          <Button
            variant="destructive"
            size="icon"
            class="rounded-full -scale-x-100"
            onClick={() => {
              CallPeer.end()
              setCallStore((prev) => ({
                ...prev,
                status: 'idle',
              }))
            }}
          >
            <Icons.PhoneMissed />
          </Button>
        </Flexbox>
      </Stack>
    </dialog>
  )
}

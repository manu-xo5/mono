import { callStatus, setCallStore, type CallStatus } from '@/call-service/store'
import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'
import { CallRipple } from './call-ripples'
import { Flexbox } from './ui/flex'
import { Icons } from './icons'
import { CallPeer, callStream } from '@/call-service/peer'
import { createEffect, For, Show } from 'solid-js'
import { EEmit } from '@/event-bus/emitter'
import { cn } from '@/utils'

const STATUS_TO_TEXT = {
  idle: '',
  incoming: 'Ringing...',
  loading: 'Calling...',
  rejected: 'Busy',
  accepted: 'On Call',
  'peer-offline': 'Offline',
  failed: 'Call Failed',
} satisfies Record<CallStatus, string>

export function CallDialog() {
  const header = () => STATUS_TO_TEXT[callStatus()]

  createEffect(() => {
    console.log('streams', callStream())
  })

  return (
    <dialog
      open={true}
      class="absolute left-1/2 top-1/2 -translate-1/2 z-10 bg-secondary text-secondary-foreground rounded-xl h-96 w-72 border shadow-xl"
    >
      <Stack class="items-center p-4 gap-6 h-full">
        <p class="text-xl xanimate-bounce animate-pulse">{header()}</p>

        <div class="size-20 bg-black rounded-full border relative">
          <Show when={callStatus() === 'incoming'}>
            <CallRipple />
          </Show>

          <img
            class="rounded-full z-20 absolute"
            src="https://lh3.googleusercontent.com/a/ACg8ocKESAosQC7kUMUPSlLmdIUPokPgTBr-tbSAeTkqIFWBcadrw9u6=s96-c"
            referrerPolicy="no-referrer"
          />
        </div>

        <div class="size-20 bg-black rounded-full border relative">
          <For each={callStream()}>
            {(track) => (
              <video
                autoplay
                playsinline
                muted
                ref={(node) => {
                  const stream = new MediaStream([track])
                  node.srcObject = stream
                }}
              />
            )}
          </For>
        </div>

        <Flexbox class="justify-center w-full mt-auto py-10">
          <Show when={callStatus() === 'incoming'}>
            <Button
              variant="default"
              size="icon"
              class="rounded-full -translate-x-12"
              onClick={() => EEmit('call:accept')}
            >
              <Icons.Phone />
            </Button>
          </Show>

          <Button
            variant="destructive"
            size="icon"
            class={cn(
              'rounded-full -scale-x-100 transition-all ease-in',
              callStatus() === 'incoming'
                ? 'rotate-0 translate-x-12'
                : 'rotate-40 translate-x-0',
            )}
            onClick={() => EEmit('call:end')}
          >
            <Icons.PhoneMissed />
          </Button>
        </Flexbox>
      </Stack>
    </dialog>
  )
}

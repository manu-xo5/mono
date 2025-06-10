import { CallApi } from '@/call-service'
import { type CallStatus } from '@/call-service/store'
import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'
import { cn } from '@/utils'
import { createEffect, Show, type Accessor } from 'solid-js'
import { CallRipple } from './call-ripples'
import { Icons } from './icons'
import { Flexbox } from './ui/flex'
import { useCallApi } from '@/call-service/useCallApi'

const STATUS_TO_TEXT = {
  idle: '',
  incoming: 'Ringing...',
  loading: 'Connecting...',
  disconnecting: 'Call Ended',
  rejected: 'Busy',
  accepted: 'On Call',
  'peer-offline': 'Offline',
  failed: 'Call Failed',
} satisfies Record<CallStatus, string>

function modal(
  node: HTMLVideoElement,
  _accessor: () => Accessor<Array<MediaStream>>,
) {
  const accessor = _accessor()
  node.onerror = (e) => {
    console.error('Video element error:', e)
  }

  node.autoplay = true
  node.playsInline = true
  node.muted = false // Assuming this is for a remote stream

  createEffect(() => {
    const streams = accessor() // Read the signal/accessor

    if (streams.length === 0 || !streams[0]) {
      if (node.srcObject) {
        node.srcObject = null
      }
      node.pause()
      console.log('No stream available, video paused.')
      return
    }

    const currentStream = streams[0] // This is the crucial part

    if (node.srcObject !== currentStream) {
      console.log('New stream detected, setting srcObject:', currentStream)
      node.srcObject = currentStream
    } else {
      console.log('Stream is the same, srcObject not updated.')
    }

    node
      .play()
      .then(() => {
        console.log('Video started playing successfully!')
      })
      .catch((error) => {
        console.error('Video play() failed:', error)
        if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
          console.warn(
            'Autoplay blocked or interrupted. User interaction may be required.',
          )
        }
      })
  })
}

export function CallDialog() {
  const { callStatus, acceptCall } = useCallApi()

  const header = () => STATUS_TO_TEXT[callStatus()]

  return (
    <dialog
      open={callStatus() !== 'idle'}
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

        {/*<div class="size-20 bg-black rounded-full border relative">
          <video use:modal={callStore().streams} playsinline autoplay muted />
        </div>
        */}

        <Flexbox class="justify-center w-full mt-auto py-10">
          <Show when={callStatus() === 'incoming'}>
            <Button
              variant="default"
              size="icon"
              class="rounded-full -translate-x-12"
              onClick={acceptCall}
            >
              <Icons.Phone />
            </Button>
          </Show>

          <Show when={callStatus() === 'accepted'}>
            <Button
              variant="destructive"
              size="icon"
              class={cn(
                'rounded-full -scale-x-100 transition-all ease-in',
                callStatus() === 'incoming'
                  ? 'rotate-0 translate-x-12'
                  : 'rotate-40 translate-x-0',
              )}
              onClick={async () => {
                const stream = await navigator.mediaDevices.getDisplayMedia({
                  video: true,
                })

                CallApi.actions.addStream(stream)
              }}
            >
              <Icons.ScreenShare />
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
            onClick={() => {
              throw Error('todo not implemented')
              // CallApi.actions.({ type: CallEvent.End })
            }}
          >
            <Icons.PhoneMissed />
          </Button>
        </Flexbox>
      </Stack>
    </dialog>
  )
}

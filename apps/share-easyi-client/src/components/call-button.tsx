import { createSignal } from 'solid-js'
import { Dialog } from './ui/dialog'
import { Stack } from './ui/stack'
import { useCallApi } from '@/call-service/useCallApi'
import { Icons } from '@/components/icons'
import { Button } from '@/components/ui/button'

function NoMicrophoneDeviceDialog(props: { onClose?: () => void }) {
  return (
    <div class="bg-secondary text-secondary-foreground rounded-xl h-96 w-72 border shadow-xl">
      <Stack class="h-full p-4 gap-2">
        <div class="text-center w-full py-10">
          <Icons.MicOff class="inline size-14 text-muted-foreground" />
        </div>

        <p class="text-xl">No microphone device found</p>

        <p class="text-sm text-muted-foreground">
          Please connect a microphone to make calls.
        </p>

        <Button
          class="mt-auto ml-auto"
          variant="default"
          onClick={props.onClose}
        >
          Close
        </Button>
      </Stack>
    </div>
  )
}

type Props = {
  otherUserId?: string
}

export function CallButton(props: Props) {
  const { call } = useCallApi()
  const [hasMicrophoneDevice, setHasMicrophoneDevice] = createSignal(true)

  return (
    <>
      <Button
        disabled={!props.otherUserId}
        size="icon"
        variant="ghost"
        onClick={() => {
          const otherUserId = props.otherUserId
          if (!otherUserId) return

          call(otherUserId)
        }}
      >
        <Icons.PhoneCall />
      </Button>

      <Dialog when={!hasMicrophoneDevice()}>
        <NoMicrophoneDeviceDialog
          onClose={() => setHasMicrophoneDevice(true)}
        />
      </Dialog>
    </>
  )
}

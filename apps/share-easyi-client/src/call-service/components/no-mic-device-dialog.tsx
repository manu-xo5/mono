import { useCallApi } from '../useCallApi'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/shared/components/dialog'
import { LogoHeadError } from '@/shared/components/logo-head-error'

export function NoMicDeviceDialog() {
  const { resetError } = useCallApi()

  return (
    <Dialog.Root open>
      <Dialog.Content icon={<LogoHeadError />}>
        <Dialog.Title>No Microphone Device Found!</Dialog.Title>

        <Dialog.Body>
          It seems that no microphone device is available. Please connect a
          microphone and try again.
        </Dialog.Body>

        <Dialog.Footer class="text-end">
          <Button
            variant="secondary"
            size="sm"
            class="mt-auto ml-auto"
            onClick={resetError}
          >
            Close
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  )
}

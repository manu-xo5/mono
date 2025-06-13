import { useCallApi } from '../useCallApi'
import { Button } from '@/components/ui/button'
import { Flexbox } from '@/components/ui/flex'
import { Dialog } from '@/shared/components/dialog'
import { LogoHead } from '@/shared/components/logo-head'

export function NoMicDeviceDialog() {
  const { resetError } = useCallApi()

  return (
    <Dialog.Root open>
      <Dialog.Content icon={<LogoHead />}>
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

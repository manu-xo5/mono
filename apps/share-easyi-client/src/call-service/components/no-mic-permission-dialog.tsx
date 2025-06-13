import { useCallApi } from '../useCallApi'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/shared/components/dialog'
import { LogoHeadError } from '@/shared/components/logo-head-error'

export function NoMicPermissionDialog() {
  const { resetError } = useCallApi()

  return (
    <Dialog.Root open>
      <Dialog.Content icon={<LogoHeadError />}>
        <Dialog.Title>Microphone Permission Required</Dialog.Title>

        <Dialog.Body>
          To use the call feature, you need to allow microphone access in your
          browser settings.
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

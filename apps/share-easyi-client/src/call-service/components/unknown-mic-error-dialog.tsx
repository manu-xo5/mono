import { useCallApi } from '../useCallApi'
import { Button, Dialog, LogoHeadError } from '@/shared/components'

export function UnknownMicErrorDialog() {
  const { resetError } = useCallApi()

  return (
    <Dialog.Root open>
      <Dialog.Content icon={<LogoHeadError />}>
        <Dialog.Title>Unknown Microphone Error</Dialog.Title>

        <Dialog.Body>
          An error occurred while trying to access the microphone. Please check
          your microphone settings and try again.
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

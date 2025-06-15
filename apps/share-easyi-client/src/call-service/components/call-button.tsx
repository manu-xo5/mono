import { useCallApi } from '@/call-service/useCallApi'
import { Button, Icons } from '@/shared/components'

type Props = {
  otherUserId?: string
}

export function CallButton(props: Props) {
  const { call } = useCallApi()

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
    </>
  )
}

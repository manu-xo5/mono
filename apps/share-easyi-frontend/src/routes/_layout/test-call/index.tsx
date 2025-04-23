import { PageContainer } from '@/components/page-container.js'
import { Avatar, AvatarImage } from '@/components/ui/avatar.js'
import { Button } from '@/components/ui/button.js'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog.js'
import { Icons } from '@/components/ui/icons.js'
import { Input } from '@/components/ui/input.js'
import { CallAction } from '@/store/call-slice/actions.js'
import { useStore } from '@/store/index.js'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/test-call/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { status } = useStore()

  return (
    <>
      <PageContainer>
        <div className="p-3">
          <Input
            defaultValue={localStorage.getItem('abc') ?? ''}
            onKeyUp={(ev) => {
              if (ev.key !== 'Enter')
                return

              const value = ev.currentTarget.value

              CallAction.makeRequest({ otherPeerId: value })
            }}
            onChange={(ev) => {
              localStorage.setItem('abc', ev.currentTarget.value)
            }}
          />
        </div>
        <p>{String(status)}</p>
        <Button
          variant="destructive"
          onClick={() => console.error('noop')}
        >
          End
        </Button>
      </PageContainer>

      <OutgoingCallDialog
        onEndCall={() => {
          console.error('todo: not implemented')
        }}
      />
    </>
  )
}

interface Props2 {
  onEndCall?: () => void
}
function OutgoingCallDialog({ onEndCall }: Props2) {
  const callStatus = useStore(s => s.callSlice.status)

  const title = (() => {
    const stateToTitle = {
      'outgoing-call': 'Ringing...',
      'on-call': '00:27',
      'call-request-rejected': 'Busy',
      'call-request-failed': 'Call Failed',
      'standby': '',
      'incoming-call': '',
    } satisfies Record<typeof callStatus, string>

    return stateToTitle[callStatus]
  })()

  return (
    <Dialog open={['outgoing-call', 'on-call', 'call-failed', 'call-rejected', 'incoming-call'].includes(callStatus)}>
      <DialogContent className="w-sm flex flex-col gap-6 items-center">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="sr-only" />
        </DialogHeader>

        <div className="pt-3 pb-9">
          <Avatar className="size-18">
            <AvatarImage src={`https://ui-avatars.com/api/?name=${'Unknown'}&size=72`} />
          </Avatar>
        </div>

        <div className="flex justify-center">
          <Button
            disabled={callStatus === 'call-failed'}
            className="rounded-full size-12"
            size="icon"
            variant="destructive"
            onClick={onEndCall}
          >
            <Icons.CallReject className="scale-x-[-1]" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

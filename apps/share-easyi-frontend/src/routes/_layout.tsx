import { IncomingCallDialog } from '@/components/incoming-call-dialog.js'
import { PageNavbar } from '@/components/page-header.js'
import { Dialog } from '@/components/ui/dialog.js'
import { getPeerIdFromStorage } from '@/routes/welcome/-index-module.js'
import { CallAction } from '@/store/call-slice/actions/incoming-call.js'
import { ensureUser, useStore } from '@/store/index.js'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout')({
  beforeLoad: async () => {
    console.log('hello before load')
    const peerId = getPeerIdFromStorage()
    if (!peerId) {
      throw redirect({
        to: '/welcome/',
      })
    }

    await ensureUser(peerId)
  },
  component: IndexLayout,
})

function IndexLayout() {
  const callStatus = useStore(s => s.callSlice.status)
  console.log(callStatus)
  // const navigate = Route.useNavigate();

  return (
    <>
      <PageNavbar title="Home" />
      <Outlet />

      <Dialog open={callStatus === 'incoming-call'}>
        <IncomingCallDialog
          onAnswer={() => {
            CallAction.acceptCall()
          }}
          onReject={() => CallAction.rejectCall()}
        />
      </Dialog>
    </>
  )
}

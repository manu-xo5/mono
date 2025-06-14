import { Outlet, createFileRoute, redirect } from '@tanstack/solid-router'
import { Auth } from '@/auth'
import { PageLoader } from '@/components/page-loader'
import { Socket } from '@/web-socket-service'
import { CallDialog } from '@/components/call-dialog'
import { CallApi } from '@/call-service'
import { CallApiProvider } from '@/call-service/useCallApi'
import { TanstackQueryProvider } from '@/tanstack-query/provider'

export const Route = createFileRoute('/_app')({
  component: RouteComponent,
  pendingMinMs: 1000,
  beforeLoad,
  pendingComponent: PageLoader,
})

async function beforeLoad() {
  const [authOk, socketOk] = await Promise.all([Auth.init(), Socket.init()])

  if (!authOk) {
    throw redirect({
      to: '/login',
    })
  }

  if (!socketOk) {
    throw redirect({
      to: '/server-down',
      mask: {
        to: '/',
      },
    })
  }

  const socket = Socket.get()
  const user = Auth.getUser()
  const callApi = new CallApi(socket, user)

  return { user, socket, callApi }
}

function RouteComponent() {
  const routerCtx = Route.useRouteContext()

  return (
    <TanstackQueryProvider>
      <CallApiProvider callApi={routerCtx().callApi}>
        <Outlet />
        <CallDialog />
      </CallApiProvider>
    </TanstackQueryProvider>
  )
}

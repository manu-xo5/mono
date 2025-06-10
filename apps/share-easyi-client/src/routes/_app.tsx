import { Outlet, createFileRoute, redirect } from '@tanstack/solid-router'
import { Auth } from '@/auth'
import { PageLoader } from '@/components/page-loader'
import { Socket } from '@/service/web-socket'
import { CallDialog } from '@/components/call-dialog'
import { CallApi } from '@/call-service/class'
import { CallApiProvider } from '@/call-service/useCallApi'

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
    <CallApiProvider callApi={routerCtx().callApi}>
      <Outlet />
      <CallDialog />
    </CallApiProvider>
  )
}

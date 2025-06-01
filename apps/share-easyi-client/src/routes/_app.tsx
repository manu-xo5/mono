import { Auth } from '@/auth'
import { CallApi } from '@/call-service/store'
import { PageLoader } from '@/components/page-loader'
import { Socket } from '@/service/web-socket'
import { createFileRoute, Outlet, redirect } from '@tanstack/solid-router'
import { CallDialog } from '@/components/call-dialog'

async function bootstrap() {
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

  const socket = Socket.getInstance()
  const user = Auth.getUser()

  CallApi.init({
    ws: socket,
    meUser: user,
  })

  return { user, socket }
}

export const Route = createFileRoute('/_app')({
  component: () => (
    <>
      <CallDialog />
      <Outlet />
    </>
  ),
  pendingMinMs: 1000,
  beforeLoad: bootstrap,
  pendingComponent: PageLoader,
})

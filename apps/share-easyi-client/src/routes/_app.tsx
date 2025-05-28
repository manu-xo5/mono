import { Auth } from '@/auth'
import { callHandler } from '@/call-service'
import { PageLoader } from '@/components/page-loader'
import { messageHandler } from '@/message-service'
import { Socket } from '@/web-socket'
import { createFileRoute, Outlet, redirect } from '@tanstack/solid-router'

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

  const socket = Socket.get()
  const user = Auth.get()

  socket.addEventListener('message', (msg) => {
    messageHandler(msg)
    callHandler({ user, socket, msg })
  })

  return { user, socket }
}

export const Route = createFileRoute('/_app')({
  component: Outlet,
  pendingMinMs: 1000,
  beforeLoad: bootstrap,
  pendingComponent: PageLoader,
})

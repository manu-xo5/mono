import { verifyUserSession, type AuthSession } from '@/auth'
import { callHandler } from '@/call-service'
import { callStore } from '@/call-service/store'
import { CallDialog } from '@/components/call-dialog'
import { PageLoader } from '@/components/page-loader'
import { TanstackQueryProvider } from '@/integrations/tanstack-query/provider'
import { messageHandler } from '@/message-service'
import { Socket } from '@/web-socket'
import {
  createRootRouteWithContext,
  Outlet,
  redirect,
} from '@tanstack/solid-router'
import { Show } from 'solid-js'

let cacheSocket: WebSocket | null = null
let cacheUser: AuthSession['user'] | null = null

async function bootstrap() {
  if (['/login', '/server-down'].includes(location.pathname)) {
    return {
      user: cacheUser,
      socket: cacheSocket,
    }
  }
  const userPromise = cacheUser ?? verifyUserSession().then((x) => x.user)

  const [user, socketOk] = await Promise.all([userPromise, Socket.init()])

  if (user == null || !socketOk) {
    throw redirect({
      to: '/server-down',
    })
  }

  const socket = Socket.get()
  socket.addEventListener('message', (msg) => {
    messageHandler(msg)
    callHandler({ user, socket, msg })
  })

  cacheUser = user
  cacheSocket = socket

  return { user, socket }
}

export const Route = createRootRouteWithContext<{
  socket: WebSocket
  user: AuthSession['user']
}>()({
  beforeLoad: bootstrap,
  pendingMs: 0,
  pendingComponent: PageLoader,
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <TanstackQueryProvider>
        <div class="bg-background">
          <Outlet />
          <Show when={callStore().status == 'on-call'}>
            <CallDialog />
          </Show>
          {/*<MessageStoreDevtools buttonPosition="up" />*/}
          {/*<TanStackRouterDevtools />*/}
          {/*<SolidQueryDevtools buttonPosition="bottom-right" />*/}
        </div>
      </TanstackQueryProvider>
    </>
  )
}

import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Stack } from '@/components/ui/stack'
import { signOutUser } from '@/lib/auth'
import { createStorage } from '@/lib/create-storage'
import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router'
import { useEffect, useState, createContext } from 'react'
import { SERVER_BASE } from '@/constants'
import { createMessageHandler, messagesActions } from '@/message-service'
import { Loader } from '@/components/ui/loader'

export const Route = createFileRoute('/_auth/home')({
  component: LayoutComponent,
  preload: false,
  staleTime: 30,
  loader: async () => {
    const roomsRes: { ok: { roomId: string }[] } = await fetch(
      SERVER_BASE + '/api/vx/room',
      {
        credentials: 'include',
      },
    ).then((r) => r.json())

    const rooms = roomsRes.ok.map((i) => i.roomId)

    recentAddrStorage.setItem('all', rooms)

    const messagesRes = await getInitialMessages(rooms)
    for (const { roomId, messages } of messagesRes) {
      messages.forEach((message) => {
        messagesActions.overwriteMessage(roomId, {
          id: message.id,
          status: 'ok',
          text: message.body,
          type: message.type,
        })
      })
    }
    console.log({ messages: messagesRes.flatMap((m) => m.messages) })

    return {
      rooms,
    }
  },
})

async function getInitialMessages(roomIdList: string[]) {
  const getQueryParam = (roomId: string) =>
    new URLSearchParams({
      roomId,
    }).toString()

  const messagesPromises = roomIdList.map((roomId) =>
    fetch(SERVER_BASE + '/api/vx/message?' + getQueryParam(roomId), {
      credentials: 'include',
    })
      .then((r) => r.json() as Promise<{ ok: any[] }>)
      .catch(() => ({
        ok: [] as any[],
      }))
      .then((messages) => ({
        roomId,
        messages: messages.ok,
      })),
  )

  return Promise.all(messagesPromises)
}

function useWebSocket() {
  const [ws, setWs] = useState<null | WebSocket>(null)

  useEffect(() => {
    const socket = new WebSocket('http://localhost:1553/ws')

    socket.addEventListener('open', () => {
      setWs(socket)
    })

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.close(1000, 'GoingAway')
        return
      }

      socket.onopen = () => {
        socket.close(1000, 'GoingAway')
      }
    }
  }, [])

  const wsStatus =
    ws == null
      ? ('CLOSED' as const)
      : (['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'] as const)[ws.readyState]!

  return {
    ws,
    wsStatus,
  }
}

export const WsContext = createContext<{
  ws: WebSocket
  wsStatus: string
}>({
  wsStatus: 'CLOSED',
  ws: null as unknown as WebSocket,
})

const recentAddrStorage = createStorage({
  getItem: (name) => localStorage.getItem('rooms' + name),
  setItem: (name, value) => localStorage.setItem('rooms' + name, value),
})

function LayoutComponent() {
  const router = useRouter()
  const navigate = Route.useNavigate()
  const wsState = useWebSocket()

  const { ws } = wsState

  function navigateToRoom(roomId: string) {
    navigate({
      to: '/home/$roomId',
      params: {
        roomId: roomId,
      },
      mask: {
        to: '/home',
      },
    })
  }

  useEffect(() => {
    if (!ws) return

    const handler = createMessageHandler()

    ws.addEventListener('message', handler)
    ws.addEventListener('error', (e) => console.error(e))
    ws.addEventListener('close', () => console.error())

    return () => ws.removeEventListener('message', handler)
  }, [ws])

  if (ws == null) {
    return (
      <div className="flex justify-center items-center">
        <Loader />
      </div>
    )
  }

  return (
    <WsContext value={{ ...wsState, ws }}>
      <PageContainer className="grid grid-cols-[300px_1fr]">
        <Stack className="bg-muted/20 border-r p-3 gap-3">
          <Input
            placeholder="User Id"
            onKeyDown={(ev) => {
              if (ev.key !== 'Enter') return
              const value = ev.currentTarget.value

              const all = recentAddrStorage
                .getItem<string[]>('all')
                .unwrapOr<string[]>([])

              if (!all.includes(value)) {
                recentAddrStorage.setItem('all', all.concat(value))
              }

              navigateToRoom(value)
            }}
          />

          <Button
            className="w-full"
            variant="destructive"
            onClick={async () => {
              signOutUser()
              router.invalidate()
            }}
          >
            Sign out
          </Button>

          <ul className="divide-y border-y flex flex-col w-full">
            {recentAddrStorage
              .getItem<string[]>('all')
              .unwrapOr(['Hello'])
              .map((addr) => (
                <li className="w-full py-1" key={addr}>
                  <Button
                    variant="ghost"
                    className="flex justify-start items-center p-3 gap-3 h-auto w-full"
                    onClick={() => navigateToRoom(addr)}
                  >
                    <span className="size-10 border-white/20 border bg-black rounded-full" />
                    <Stack>
                      {addr.length > 20
                        ? addr.substring(0, 17).concat('...')
                        : addr}
                      <span className="text-xs text-muted-foreground pointer-events-none">
                        Lorem Ipsume text sample
                      </span>
                    </Stack>
                  </Button>
                </li>
              ))}
          </ul>
        </Stack>

        <Outlet />
      </PageContainer>
    </WsContext>
  )
}

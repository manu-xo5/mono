import { API_VX } from '@/api'
import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Stack } from '@/components/ui/stack'
import { SERVER_BASE } from '@/constants'
import { signOutUser } from '@/lib/auth'
import { createStorage } from '@/lib/create-storage'
import { createMessageHandler } from '@/message-service'
import {
  addToStorage,
  appendMessageIds,
  newMessage,
} from '@/message-service/actions'
import {
  Message,
  MessagesRecord,
  messageStore,
  useMessageStore,
} from '@/message-service/store'
import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router'
import { createContext, useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

export const Route = createFileRoute('/_auth/home')({
  component: LayoutComponent,
  preload: false,
  staleTime: 30,
  pendingComponent: () => null,
  loader: () => {
    ;(async () => {
      const storedRooms = Object.keys(messageStore.getState().rooms)
      const allRooms = await API_VX('/room/all')
        .then((r) => r.json())
        .then((json) => json.ok as { roomId: string }[])

      const newRooms = allRooms.filter(
        (room) => !storedRooms.includes(room.roomId),
      )
      messageStore.setState((prev) => ({
        rooms: {
          ...prev.rooms,
          ...Object.fromEntries(newRooms.map((room) => [room.roomId, []])),
        },
      }))

      const roomId = allRooms[0]?.roomId
      if (roomId) {
        const newMessages = await fetchNewMessages(roomId)

        console.log(newMessages.records)

        messageStore.setState((prev) => ({
          messages: {
            ...prev.messages,
            ...newMessages.records,
          },
          rooms: {
            ...prev.rooms,
            [roomId]: appendMessageIds(roomId, ...newMessages.ids),
          },
        }))
      }
      void 0
    })()
  },
})

async function fetchNewMessages(roomId: string) {
  const { messages, rooms } = messageStore.getState()
  const lastMessageId = rooms[roomId]?.at(-1)
  const lastMessage = lastMessageId ? messages[lastMessageId] : undefined
  const filters: [string, string][] = []

  filters.push(['roomId', roomId])
  if (lastMessage) {
    filters.push(['afterUpdatedAt', lastMessage.updatedAt])
  }

  const qp = new URLSearchParams(filters).toString()

  const res = await API_VX('/message/byRoomId?' + qp)

  if (!res.ok) {
    return {
      ids: [],
      records: {},
    }
  }
  const newMessages = await res
    .json()
    .then((json) => json.ok as any[])
    .catch(() => [])

  const newMessageIds = newMessages.map((msg) => msg.id as string)
  const newMessageRecords = newMessages
    .map(
      (msg): Message => ({
        type: msg.type,
        text: msg.body,
        id: msg.id,
        status: 'ok',
        updatedAt: msg.updatedAt,
      }),
    )
    .reduce((acc, msg) => ({ ...acc, [msg.id]: msg }), {} as MessagesRecord)

  return {
    ids: newMessageIds,
    records: newMessageRecords,
  }
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
  const roomIdList = useMessageStore(useShallow((s) => Object.keys(s.rooms)))

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

  return (
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
          {roomIdList.map((addr) => (
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

      {ws == null ? null : (
        <WsContext value={{ ...wsState, ws }}>
          <Outlet />
        </WsContext>
      )}
    </PageContainer>
  )
}

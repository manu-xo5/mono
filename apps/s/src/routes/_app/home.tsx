import { API_VX } from '@/api'
import { Sidebar } from '@/components/main-sidebar'
import { PageContainer } from '@/components/page-container'
import { appendMessageIds } from '@/message-service/actions'
import type { Message, MessagesRecord } from '@/message-service/store'
import { messageStore, useMessageStore } from '@/message-service/store'
import { getWebSocket } from '@/web-socket'
import { createFileRoute, Outlet } from '@tanstack/solid-router'

export const Route = createFileRoute('/_app/home')({
  component: LayoutComponent,
  preload: false,
  staleTime: 30,
  pendingComponent: () => null,
  beforeLoad: async () => ({ wsState: await getWebSocket() }),
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
        ...prev,
        rooms: {
          ...prev.rooms,
          ...Object.fromEntries(newRooms.map((room) => [room.roomId, []])),
        },
      }))

      const roomId = allRooms[0]?.roomId
      if (roomId) {
        const newMessages = await fetchNewMessages(roomId)

        messageStore.setState((prev) => ({
          ...prev,
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

function LayoutComponent() {
  const context = Route.useRouteContext()
  const roomIdList = Object.keys(useMessageStore().rooms)

  return (
    <PageContainer class="grid grid-cols-[300px_1fr]">
      <Sidebar user={context().user} conversationIds={roomIdList} />

      {context().wsState.ws == null ? null : <Outlet />}
    </PageContainer>
  )
}

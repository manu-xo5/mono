import { Sidebar } from '@/components/main-sidebar'
import { PageContainer } from '@/components/page-container'
import { messagesActions } from '@/message-service'
import { fetchNewMessages, fetchRooms } from '@/message-service/api'
import { messageStore, roomStore, setRoomStore } from '@/message-service/store'
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
      const roomsRes = await fetchRooms()
      const allRooms = roomsRes.all.map((room) => room.roomId)
      setRoomStore(
        roomsRes.all.reduce(
          (acc, room) => Object.assign(acc, { [room.roomId]: room }),
          {} as typeof roomStore,
        ),
      )

      messagesActions.upsertRoomIds(allRooms)

      allRooms.forEach(async (roomId) => {
        const newMessages = await fetchNewMessages(roomId)
        const lastMessageIdx = messageStore.rooms[roomId].length
        const messagesRecord = Object.values(newMessages.records)
        messagesActions.addToStorage(messagesRecord)
        messagesActions.appendMessageIds(
          roomId,
          newMessages.ids,
          lastMessageIdx,
        )
      })
    })()
  },
})

function LayoutComponent() {
  const context = Route.useRouteContext()

  return (
    <PageContainer class="grid grid-cols-[300px_1fr]">
      <Sidebar />

      {context().wsState.ws == null ? null : <Outlet />}
    </PageContainer>
  )
}

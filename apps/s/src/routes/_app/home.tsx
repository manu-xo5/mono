import { Sidebar } from '@/components/main-sidebar'
import { PageContainer } from '@/components/page-container'
import { messagesActions } from '@/message-service'
import { appendMessageIds } from '@/message-service/actions'
import { fetchNewMessages, fetchRooms } from '@/message-service/api'
import { messageStore, setMessageStore } from '@/message-service/store'
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

      const allRooms = roomsRes.all

      setMessageStore(
        'rooms',
        Object.fromEntries(roomsRes.new.map((room) => [room.roomId, []])),
      )

      allRooms.forEach(async ({ roomId }) => {
        const newMessages = await fetchNewMessages(roomId)
        messagesActions.addToStorage(Object.values(newMessages.records))

        setMessageStore('rooms', {
          [roomId]: appendMessageIds(roomId, ...newMessages.ids),
        })
      })
      console.log(allRooms)
    })()
  },
})

function LayoutComponent() {
  const context = Route.useRouteContext()

  return (
    <PageContainer class="grid grid-cols-[300px_1fr]">
      <Sidebar user={context().user} conversationIds={messageStore.roomIds} />

      {context().wsState.ws == null ? null : <Outlet />}
    </PageContainer>
  )
}

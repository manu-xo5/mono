import { Sidebar } from '@/components/main-sidebar'
import { PageContainer } from '@/components/page-container'
import { messagesActions } from '@/message-service'
import { fetchRooms, flushUnsentMessage } from '@/message-service/api'
import {
  roomStore,
  setMessageStore,
  setRoomStore,
} from '@/message-service/store'
import { messageSync } from '@/message-service/sync'
import { getWebSocket } from '@/web-socket'
import { createFileRoute, Outlet } from '@tanstack/solid-router'
import { unwrap } from 'solid-js/store'

export const Route = createFileRoute('/_app/home')({
  component: LayoutComponent,
  preload: false,
  staleTime: 30,
  pendingComponent: () => null,
  beforeLoad: async () => ({ wsState: await getWebSocket() }),
  loader: () => {
    ;(async () => {
      setMessageStore(messageSync.read())

      messageSync.sync

      const roomsRes = await fetchRooms()
      const allRooms = roomsRes.all.map((room) => room.roomId)
      setRoomStore(
        roomsRes.all.reduce(
          (acc, room) => Object.assign(acc, { [room.roomId]: room }),
          {} as typeof roomStore,
        ),
      )

      messagesActions.upsertRoomIds(allRooms)

      const messageStore = await messageSync.sync(allRooms)
      setMessageStore(messageStore)

      flushUnsentMessage()
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

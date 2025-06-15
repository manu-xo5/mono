import { Outlet, createFileRoute } from '@tanstack/solid-router'
import { Sidebar } from './-components/main-sidebar'
import type { roomStore } from '@/message-service/store'
import { PageContainer } from '@/shared/components'
import { messagesActions } from '@/message-service'
import { fetchRooms, flushUnsentMessage } from '@/message-service/api'
import { setMessageStore, setRoomStore } from '@/message-service/store'
import { messageSync } from '@/message-service/sync'

export const Route = createFileRoute('/_app/home')({
  component: LayoutComponent,
  preload: false,
  staleTime: 30,
  pendingComponent: () => null,
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
  return (
    <PageContainer class="grid grid-cols-[300px_1fr]">
      <Sidebar />

      <Outlet />
    </PageContainer>
  )
}

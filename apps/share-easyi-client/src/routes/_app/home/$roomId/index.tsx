import type { AuthSession } from '@/auth'
import { MessageList } from '@/components/message-list'
import { RoomHeader } from '@/components/room-header'
import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'
import { messagesActions } from '@/message-service'
import { getMessages, messageStore, roomStore } from '@/message-service/store'
import { pgTimestamp } from '@/utils'
import { createFileRoute } from '@tanstack/solid-router'
import { createEffect, createSignal } from 'solid-js'

export const Route = createFileRoute('/_app/home/$roomId/')({
  component: RouteComponent,
})

function sendMessage({
  user,
  ws,
  body,
  roomId,
  toUserId,
}: {
  user: AuthSession['user']
  ws: WebSocket
  body: string
  roomId: string
  toUserId: string
}) {
  const msg = messagesActions.newMessage(roomId, {
    status: null,
    type: 'text',
    text: body,
    updatedAt: pgTimestamp(new Date()),
    from: user.id,
  })

  if (!msg) {
    // maybe failed to generate id
    return
  }

  ws.send(
    JSON.stringify({
      id: msg.id,
      type: msg.type,
      body: {
        to: toUserId,
        from: user.id,
        text: msg.text,
      },
    }),
  )
}

function RouteComponent() {
  let messageDiv!: undefined | HTMLUListElement
  const params = Route.useParams()
  const context = Route.useRouteContext()
  const { user, wsState } = context()
  const ws = wsState.ws!

  const [messageInput, setMessageInput] = createSignal('')

  const userId = user.id
  const messages = () => getMessages(messageStore.rooms[params().roomId] ?? [])

  const otherUserId = () =>
    params()
      .roomId.split('-')
      .find((id) => id != userId)!

  const otherUserData = () => {
    const room = roomStore[params().roomId]

    if (room) {
      return room.user1 === userId ? room.user2Data : room.user1Data
    }
    return null
  }

  createEffect(() => {
    void messages()
    messageDiv?.scrollTo({ top: 9999, behavior: 'smooth' })
  })

  return (
    <Stack class="relative min-h-0">
      <RoomHeader otherUser={otherUserData()} />

      <Stack class="flex-1 min-h-0 px-3 pb-3">
        <MessageList ref={messageDiv} class="grow" messages={messages()} />

        <div class="grid grid-cols-[1fr_auto] w-full border border-zinc-800 dark:bg-transparent py-2 px-3 rounded-lg">
          <textarea
            rows={2}
            class="w-full resize-none outline-none"
            placeholder="Send a message (Ctrl+Enter for new line)"
            value={messageInput()}
            onInput={(ev) => setMessageInput(ev.currentTarget.value)}
            onKeyDown={(ev) => {
              if (ev.key !== 'Enter') return
              ev.preventDefault()
              if (ev.ctrlKey) {
                setMessageInput((prev) => prev + '\n')
                return
              }

              const value = messageInput()
              //messageInputRef.current?.focus()
              if (!value) return

              ev.currentTarget.value = ''
              sendMessage({
                ws,

                body: value,
                user: user,
                roomId: params().roomId,
                toUserId: otherUserId(),
              })
            }}
          />

          <div class="self-end">
            <Button
              size="sm"
              onClick={() => {
                const value = messageInput()
                //messageInputRef.current?.focus()
                if (!value) return
                sendMessage({
                  ws,

                  body: value,
                  user: user,
                  roomId: params().roomId,
                  toUserId: otherUserId(),
                })

                window.requestIdleCallback(
                  () => {
                    messageDiv?.scrollTo({ top: 9999, behavior: 'smooth' })
                  },
                  { timeout: 500 },
                )
              }}
            >
              Send
            </Button>
          </div>
        </div>
      </Stack>
    </Stack>
  )
}

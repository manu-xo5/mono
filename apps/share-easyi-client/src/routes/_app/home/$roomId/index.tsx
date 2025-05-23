import { MessageList } from '@/components/message-list'
import { Button } from '@/components/ui/button'
import { Flexbox } from '@/components/ui/flex'
import { Stack } from '@/components/ui/stack'
import { pgTimestamp } from '@/utils'
import { messagesActions } from '@/message-service'
import { getMessages, messageStore } from '@/message-service/store'
import { createFileRoute } from '@tanstack/solid-router'
import { createSignal } from 'solid-js'
import type { AuthSession } from '@/auth'

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

  return (
    <Stack class="relative min-h-0">
      <Flexbox class="w-full bg-card py-3 px-6 gap-3 border-b">
        <span class="size-10 border rounded-full inline-block bg-black" />

        <p class="relative top-[-1px]">{otherUserId()}</p>
      </Flexbox>

      <Stack class="flex-1 min-h-0 px-3 pb-3">
        <MessageList class="grow" messages={messages()} />

        <div class="grid grid-cols-[1fr_auto] w-full border border-zinc-800 dark:bg-transparent py-2 px-3 rounded-lg">
          <textarea
            rows={2}
            class="w-full resize-none outline-none"
            placeholder="Send a message (Ctrl+Enter for new line)"
            value={messageInput()}
            onInput={(ev) => setMessageInput(ev.currentTarget.value)}
            onKeyDown={(ev) => {
              if (ev.key !== 'Enter') return;
              ev.preventDefault()
              if (ev.ctrlKey) {
                setMessageInput(prev => prev + "\n")
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
              class="font-bold"
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
                    // messageListRef.current?.scrollTo({ top: 9999, })
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

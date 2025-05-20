import { MessageList } from '@/components/message-list'
import { Button } from '@/components/ui/button'
import { Flexbox } from '@/components/ui/flex'
import { Stack } from '@/components/ui/stack'
import { pgTimestamp } from '@/utils'
import { messagesActions } from '@/message-service'
import { getMessages, useMessageStore } from '@/message-service/store'
import { createFileRoute } from '@tanstack/solid-router'
import { createSignal } from 'solid-js'

export const Route = createFileRoute('/_app/home/$roomId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { roomId } = Route.useParams()()
  const context = Route.useRouteContext()
  const { user, wsState } = context()
  const ws = wsState.ws!

  const [messageInput, setMessageInput] = createSignal('')

  const userId = user.id
  const messages = () => getMessages(useMessageStore().rooms[roomId] ?? [])

  const otherUserId = roomId.split('-').find((id) => id != userId)!
  console.log("room messages:")
  console.log(messages())

  // const messageInputRef = useRef<ComponentRef<'textarea'>>(null)
  // const messageListRef = useRef<ComponentRef<'ul'>>(null)

  return (
    <Stack class="relative min-h-0">
      <Flexbox class="w-full bg-card py-3 px-6 gap-3 border-b">
        <span class="size-10 border rounded-full inline-block bg-black" />

        <p class="relative top-[-1px]">{otherUserId}</p>
      </Flexbox>

      <Stack class="flex-1 min-h-0 px-3 pb-3">
        <MessageList class="grow" messages={messages()} />

        <div class="grid grid-cols-[1fr_auto] w-full border border-zinc-800 dark:bg-transparent py-2 px-3 rounded-lg">
          <textarea
            rows={2}
            class="w-full resize-none outline-none"
            placeholder="Send a message"
            onInput={(ev) => setMessageInput(ev.currentTarget.value)}
          />

          <div class="self-end">
            <Button
              class="font-bold"
              size="sm"
              onClick={() => {
                const value = messageInput()
                if (!value) {
                  //messageInputRef.current?.focus()
                  return
                }

                const msg = messagesActions.newMessage(roomId, {
                  status: null,
                  type: 'text',
                  text: value,
                  updatedAt: pgTimestamp(new Date()),
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
                      to: otherUserId,
                      from: user.id,
                      text: msg.text,
                    },
                  }),
                )

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

import { MessageList } from '@/components/message-list'
import { Button } from '@/components/ui/button'
import { Flexbox } from '@/components/ui/flex'
import { Stack } from '@/components/ui/stack'
import { pgTimestamp } from '@/lib/utils'
import { messagesActions } from '@/message-service'
import { getMessages, useMessageStore } from '@/message-service/store'
import { WsContext } from '@/routes/_auth/home'
import { createFileRoute } from '@tanstack/react-router'
import { ComponentRef, use, useRef } from 'react'
import { useShallow } from 'zustand/react/shallow'

export const Route = createFileRoute('/_auth/home/$roomId/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { roomId } = Route.useParams()
  const { user } = Route.useRouteContext()
  const { ws, wsStatus } = use(WsContext)

  const userId = user.id
  const messages = useMessageStore(
    useShallow((s) => getMessages(s.rooms[roomId] ?? [])),
  )

  const otherUserId = roomId.split('-').find((id) => id != userId)!

  const messageInputRef = useRef<ComponentRef<'textarea'>>(null)
  const messageListRef = useRef<ComponentRef<'ul'>>(null)

  return (
    <Stack className="relative min-h-0">
      <Flexbox className="w-full bg-muted py-3 px-6 gap-3">
        <span className="size-6 rounded-full inline-block bg-black" />
        <p className="relative top-[-1px]">
          {otherUserId} <span className="text-xs lowercase">`{wsStatus}`</span>
        </p>
      </Flexbox>

      <Stack className="flex-1 min-h-0 px-3 pb-3">
        <MessageList
          ref={messageListRef}
          className="grow"
          messages={messages}
        />

        <div className="grid grid-cols-[1fr_auto] w-full border border-zinc-800 dark:bg-transparent py-2 px-3 rounded-lg">
          <textarea
            ref={messageInputRef}
            rows={2}
            className="w-full resize-none outline-none"
            placeholder="Send a message"
          />

          <div className="self-end">
            <Button
              className="font-bold"
              size="sm"
              onClick={() => {
                const value = messageInputRef.current?.value
                if (!value) {
                  messageInputRef.current?.focus()
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
                    messageListRef.current?.scrollTo({
                      top: 9999,
                    })
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

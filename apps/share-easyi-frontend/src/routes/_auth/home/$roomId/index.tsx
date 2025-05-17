import { Button } from '@/components/ui/button'
import { Flexbox } from '@/components/ui/flex'
import { Stack } from '@/components/ui/stack'
import { SERVER_BASE } from '@/constants'
import { createRoomId } from '@/lib/utils'
import { messagesActions } from '@/message-service'
import { useMessageStore } from '@/message-service/store'
import { WsContext } from '@/routes/_auth/home'
import { queryOptions, useQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { ComponentRef, use, useRef } from 'react'

export const Route = createFileRoute('/_auth/home/$roomId/')({
  component: RouteComponent,
})

/*
 *
 *
 *
 *
 * did send and unsent event on front end.
 * next is pull messages from server with rq and
 * invalidate on reload, show red text if failed
 *
 *
 *
 *
 */

const messageQO = (userId: string, roomId: string) =>
  queryOptions({
    queryKey: [userId, 'roomId', roomId],
    queryFn: () => {
      const qp = new URLSearchParams({
        roomId,
        limit: '50',
        offset: '0',
      }).toString()
      return fetch(SERVER_BASE + '/api/vx/message?' + qp, {
        credentials: 'include',
      })
    },
  })

function RouteComponent() {
  const { roomId } = Route.useParams()
  const { user } = Route.useRouteContext()
  const { ws, wsStatus } = use(WsContext)

  const userId = user.id
  const messages = useMessageStore().messagesRecord
  const otherUserId = roomId.split("-").find(id => id != userId)!;

  const messageInputRef = useRef<ComponentRef<'textarea'>>(null)
  const messagesQry = useQuery(messageQO(userId, roomId))

  return (
    <Stack className="relative">
      <Flexbox className="w-full bg-muted py-3 px-6 gap-3">
        <span className="size-6  rounded-full inline-block bg-black" />
        <p className="relative top-[-1px]">
          {otherUserId} <span className="text-xs lowercase">`{wsStatus}`</span>
        </p>
      </Flexbox>

      <Stack className="flex-1 w-full px-3 pb-3">
        <ul className="flex-1 h-full overflow-y-auto">
          {Object.values(messages).map((msg) => (
            <li key={msg.id}>
              {msg.text}
              {msg.status == null
                ? '[ ]'
                : { ok: '[x]', fail: '[!]' }[msg.status]}
            </li>
          ))}
        </ul>

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

import { createFileRoute } from '@tanstack/react-router'
import { WsContext } from '@/routes/_auth/home'
import { use, useEffect, useState } from 'react'
import { Loader } from '@/components/ui/loader'
import { Flexbox } from '@/components/ui/flex'
import { Stack } from '@/components/ui/stack'
import { Button } from '@/components/ui/button'
import { createRoomId } from '@/lib/utils'

export const Route = createFileRoute('/_auth/home/$roomId/')({
  component: RouteComponent,
})

// maybe use zod

type TextMessageEvent = {
  type: 'message'
  data: {
    forRoomId: string
    text: string
  }
}
type TextMessagePayload = TextMessageEvent['data'] & {
  id: string
}

function createMessageHandler({
  roomId,
  setState,
}: {
  roomId: string
  setState: React.Dispatch<React.SetStateAction<TextMessagePayload[]>>
}) {
  return function (message: MessageEvent) {
    const parsedMessage = (() => {
      try {
        return JSON.parse(message.data) as TextMessageEvent
      } catch {
        return null
      }
    })()

    if (!parsedMessage) return
    if (parsedMessage.data.forRoomId !== roomId) return

    setState((prev) => {
      const id = crypto.randomUUID()
      return prev.concat({
        id,
        ...parsedMessage.data,
      })
    })
  }
}

/*
 *
 *
 *
 *
 * did  implemented receiving funnel
 * next is send and handling sent message on server
 *
 *
 *
 *
 */

function RouteComponent() {
  const { roomId: otherUserId } = Route.useParams()
  const { user } = Route.useRouteContext()
  const [messages, setMessages] = useState<TextMessagePayload[]>([])
  const { ws, wsStatus } = use(WsContext)

  const userId = user.id

  useEffect(() => {
    if (!ws) return
    const roomId = createRoomId(userId, otherUserId)

    const handler = createMessageHandler({
      roomId,
      setState: setMessages,
    })

    ws.addEventListener('message', handler)

    return () => ws.removeEventListener('message', handler)
  }, [ws, otherUserId, userId])

  if (!ws) {
    return (
      <div className="flex justify-center items-center">
        <Loader />
      </div>
    )
  }

  return (
    <Stack className="relative">
      <Flexbox className="w-full bg-muted py-3 px-6 gap-3">
        <span className="size-6  rounded-full inline-block bg-black" />
        <p className="relative top-[-1px]">
          {otherUserId} <span className="text-xs lowercase">`{wsStatus}`</span>
        </p>
      </Flexbox>

      <Stack className="flex-1 w-full px-3 pb-3">
        <ul className="flex-1 h-full">
          {messages.map((msg) => (
            <li key={msg.id}>{msg.text}</li>
          ))}
        </ul>

        <div className="grid grid-cols-[1fr_auto] w-full border border-zinc-800 dark:bg-transparent py-2 px-3 rounded-lg">
          <textarea
            rows={2}
            className="w-full resize-none outline-none"
            placeholder="Send a message"
          />

          <div className="self-end">
            <Button className="font-bold" size="sm">
              Send
            </Button>
          </div>
        </div>
      </Stack>
    </Stack>
  )
}

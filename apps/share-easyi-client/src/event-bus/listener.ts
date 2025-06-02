import type { MessageDeliveryEvent, MessageSent } from '@/types'
import { messagesActions } from '@/message-service'
import { Auth } from '@/auth'
import { pgTimestamp } from '@/utils'
import { Socket } from '@/service/web-socket'

export function handleMessageDelivery(msg: MessageDeliveryEvent) {
  if (msg.status == 'ok') {
    messagesActions.moveToPersistStorage(msg.body.id)
  }
}

export function handleMessageSend({ body, roomId, toUser }: MessageSent) {
  const user = Auth.getUser()
  const ws = Socket.get()

  const msg = messagesActions.newMessage(roomId, {
    status: null,
    type: 'text',
    text: body,
    updatedAt: pgTimestamp(new Date()),
    from: user.id,
    to: toUser,
    roomId: roomId,
  })

  ws.send(
    JSON.stringify({
      id: msg.id,
      type: msg.type,
      body: {
        to: toUser,
        from: user.id,
        text: msg.text,
      },
    }),
  )
}

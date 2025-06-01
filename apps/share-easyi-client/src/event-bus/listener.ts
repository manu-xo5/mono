import { messagesActions } from '@/message-service'
import type {
  MessageDeliveryEvent,
  MessageReceiveEvent,
} from '@/types'

export function handleNewMessage(msg: MessageReceiveEvent) {
  const body = msg.body

  messagesActions.addToStorage([
    {
      id: body.id,
      type: body.type,
      text: body.body,
      status: 'ok',
      from: body.from,
      to: body.to,
      roomId: msg.roomId,
      updatedAt: body.updatedAt,
    },
  ])

  messagesActions.appendMessageIds(msg.roomId, [body.id])
}

export function handleMessageDelivery(msg: MessageDeliveryEvent) {
  if (msg.status == 'ok') {
    messagesActions.moveToPersistStorage(msg.body.id)
  }
}

export function handleMessageSend(/*{ body, roomId, toUser }: MessageSent*/) {
  throw new Error('remove event bus')
  // const user = Auth.getUser()
  //
  // const msg = messagesActions.newMessage(roomId, {
  //   status: null,
  //   type: 'text',
  //   text: body,
  //   updatedAt: pgTimestamp(new Date()),
  //   from: user.id,
  //   to: toUser,
  //   roomId: roomId,
  // })
  //
  // ws.send(
  //   JSON.stringify({
  //     id: msg.id,
  //     type: msg.type,
  //     body: {
  //       to: toUser,
  //       from: user.id,
  //       text: msg.text,
  //     },
  //   }),
  // )
}

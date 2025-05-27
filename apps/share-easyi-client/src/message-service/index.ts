import { safeParse } from '@/utils'
import * as messagesActions from './actions'
import type { MessageStoreApi } from './store'
import type { Event, MessageDeliveryEvent, MessageReceiveEvent } from '@/types'

// maybe use zod
export type HandlerArg = {
  event: Event
  messageStore: MessageStoreApi
}

async function handleMessageDelivery(msg: MessageDeliveryEvent) {
  if (msg.status == 'ok') {
    messagesActions.moveToPersistStorage(msg.body.id)
  }
}

async function handleMessageReceive(msg: MessageReceiveEvent) {
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

export function messageHandler(message: MessageEvent) {
  const [data, ok] = safeParse(message.data)
  if (!ok) return

  const parsedMessage = data as Event

  if (!parsedMessage) return

  switch (parsedMessage.type) {
    case 'message-delivery':
      handleMessageDelivery(parsedMessage)
      break

    case 'message-receive':
      handleMessageReceive(parsedMessage)
      break
  }
}

export { messagesActions }

import * as messagesActions from './actions'
import type { MessageStoreApi } from './store'

// maybe use zod
export type MessageDeliveryEvent =
  | {
      type: 'message-delivery'
      status: 'ok'
      body: {
        id: string
        roomId: string
        updatedAt: string
        type: 'text'
        from: string
        to: string
        body: string
        deleted: boolean | null
      }
    }
  | {
      type: 'message-delivery'
      status: 'fail'
      body: {
        id: string
        error: string
      }
    }

export type MessageReceiveEvent = {
  type: 'message-receive'
  roomId: string
  body: {
    id: string
    type: 'text'
    from: string
    to: string
    roomId: string
    body: string
    updatedAt: string
  }
}

type Event = MessageDeliveryEvent | MessageReceiveEvent
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

export function createMessageHandler() {
  return async function (message: MessageEvent) {
    const parsedMessage = (() => {
      try {
        return JSON.parse(message.data) as Event
      } catch {
        return null
      }
    })()

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
}

export { messagesActions }

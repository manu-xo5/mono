import { sleep } from '@/lib/utils'
import { MessageId, MessageStoreApi } from './store'
import * as messagesActions from './actions'

// maybe use zod
export type MessageDeliveryEvent =
  | {
      id: string
      type: 'message-delivery'
      body: {
        id: MessageId
      }
      status: 'ok'
    }
  | {
      id: string
      type: 'message-delivery'
      status: 'fail'
      error: string
    }

export type MessageReceiveEvent = {
  id: string
  type: 'message-receive'
  roomId: string
  body: {
    type: 'text'
    from: string
    to: string
    body: string
  }
}

type Event = MessageDeliveryEvent | MessageReceiveEvent
export type HandlerArg = {
  event: Event
  messageStore: MessageStoreApi
}

async function handleMessageDelivery(msg: MessageDeliveryEvent) {
  await sleep(1000)
  messagesActions.updateMessage(msg.id, {
    status: msg.status,
  })

  if (msg.status == 'ok') {
    messagesActions.updateMessageId(msg.id, msg.body.id)
  }
}

async function handleMessageReceive(msg: MessageReceiveEvent) {
  const body = msg.body

  const ok = messagesActions.newMessage(msg.roomId, {
    type: body.type,
    text: body.body,
    status: 'ok',
  })

  if (!ok) {
    console.error('received message but failed to update view')
  }
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

    console.log({ parsedMessage })

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

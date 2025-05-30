import { createNanoEvents } from 'nanoevents'
import {
  handleMessageDelivery,
  handleMessageSend,
  handleNewMessage,
  handler,
} from './listener'
import type { Event, MessageDeliveryEvent, MessageReceiveEvent, MessageSent } from '@/types'
import { safeParse } from '@/utils'

interface EventMap {
  ping: () => void

  'ws:message': (msg: MessageEvent<any>['data']) => void

  'message:receive': (msg: MessageReceiveEvent) => void
  'message:delivered': (msg: MessageDeliveryEvent) => void
  'message:send': (data: MessageSent) => void
}

const EventBus = createNanoEvents<EventMap>()
const EEmit = <K extends keyof EventMap>(
  event: K,
  ...args: Parameters<EventMap[K]>
) => {
  EventBus.emit(event, ...args)
}
EventBus.on('ping', handler)

EventBus.on('message:receive', handleNewMessage)
EventBus.on('message:delivered', handleMessageDelivery)
EventBus.on('message:send', handleMessageSend)

EventBus.on('ws:message', (msg) => {
  const [data, ok] = safeParse(msg)
  if (!ok) return

  const parsedMessage = data as Event

  if (!parsedMessage) return

  switch (parsedMessage.type) {
    case 'message-delivery':
      EEmit('message:delivered', parsedMessage)
      break

    case 'message-receive':
      EEmit('message:receive', parsedMessage)
      break
  }
})

export { EEmit }

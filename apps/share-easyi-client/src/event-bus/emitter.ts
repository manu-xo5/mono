import type {
  CallRequest,
  Event,
  MessageDeliveryEvent,
  MessageReceiveEvent,
  MessageSent,
} from '@/types'
import { safeParse } from '@/utils'
import { run } from 'effection'
import { createNanoEvents } from 'nanoevents'
import {
  handleMessageDelivery,
  handleMessageSend,
  handleNewMessage,
} from './listener'

interface EventMap {
  'ws:message': (msg: MessageEvent<any>['data']) => void

  'message:receive': (msg: MessageReceiveEvent) => void
  'message:delivered': (msg: MessageDeliveryEvent) => void
  'message:send': (data: MessageSent) => void

  // 'call:receive': (msg: MakeCallRequest) => void
  'call:request': (arg: CallRequest) => void
  'call:accept': () => void
}

const EventBus = createNanoEvents<EventMap>()
const EEmit = <K extends keyof EventMap>(
  event: K,
  ...args: Parameters<EventMap[K]>
) => {
  EventBus.emit(event, ...args)
}

EventBus.on('message:receive', handleNewMessage)
EventBus.on('message:delivered', handleMessageDelivery)
EventBus.on('message:send', handleMessageSend)

EventBus.on('call:accept', () => {
  run(function* () {
    console.log('call accepted')
    throw new Error('remove event bus')
  })
})

EventBus.on('call:request', (arg) => {
  run(function* () {
    console.log('calling')
    throw new Error('remove event bus')
  })
})

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

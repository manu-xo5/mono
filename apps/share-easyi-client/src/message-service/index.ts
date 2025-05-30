import type { Event } from '@/types'
import * as messagesActions from './actions'
import type { MessageStoreApi } from './store'

// maybe use zod
export type HandlerArg = {
  event: Event
  messageStore: MessageStoreApi
}

export { messagesActions }

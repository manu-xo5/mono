import type { Setter } from 'solid-js'
import { createStore } from 'solid-js/store'

export type RoomId = string
export type MessageId = string
export type Message = {
  id: MessageId
  type: 'text'
  text: string
  status: null | 'ok' | 'fail'
  updatedAt: string
}

export type MessagesRecord = Record<MessageId, Message>

type MessageStore = {
  rooms: {
    [roomId: RoomId]: MessageId[]
  }
  messages: MessagesRecord
  optimisticMessages: MessagesRecord
  roomIds: RoomId[]
}

const local = JSON.parse(localStorage.getItem('pink-parrot') ?? 'null') ?? {
  rooms: {},
  messages: {},
  optimisticMessages: {},

  get roomIds() {
    return Object.keys(this.rooms)
  },
}
const [messageStore, setMessageStore] = createStore<MessageStore>(local)

export { messageStore, setMessageStore }

export const messageStore__ = {
  setState: ((x) => {
    setMessageStore(x)

    localStorage.setItem('pink-parrot', JSON.stringify(messageStore))
  }) as Setter<MessageStore>,
}

export type MessageStoreApi = typeof messageStore
export const useMessageStore = messageStore

export function getMessages(messageIdList: string[]) {
  const { optimisticMessages, messages } = messageStore

  return messageIdList
    .map((id) => messages[id] ?? optimisticMessages[id] ?? null)
    .filter((message) => message != null)
}

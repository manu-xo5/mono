import { createEffect, createReaction, type Setter } from 'solid-js'
import { createStore, unwrap, type SetStoreFunction } from 'solid-js/store'

export type RoomId = string
export type MessageId = string
export type Message = {
  id: MessageId
  type: 'text'
  text: string
  status: null | 'ok' | 'fail'
  from: string
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

type AuthUser = {
  id: string
  name: string
  email: string
  image: string
}

const local = JSON.parse(localStorage.getItem('pink-parrot') ?? 'null') ?? {
  rooms: {},
  messages: {},
  optimisticMessages: {},

  get roomIds() {
    return Object.keys(this.rooms)
  },
}

const [messageStore, _setMessageStore] = createStore<MessageStore>(local)
// @ts-ignore
const setMessageStore: SetStoreFunction<MessageStore> = (...x) => {
  // @ts-ignore
  _setMessageStore(...x)
  queueMicrotask(() => {
    const store = unwrap(messageStore)
    localStorage.setItem('pink-parrot', JSON.stringify(store))
  })
}

const [roomStore, setRoomStore] = createStore<
  Record<
    RoomId,
    {
      roomId: string
      user1: string
      user2: string
      user1Data: AuthUser
      user2Data: AuthUser
    }
  >
>({})

export { messageStore, setMessageStore, roomStore, setRoomStore }

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

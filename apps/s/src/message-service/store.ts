import { createSignal, type Setter } from 'solid-js'

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
}

const local = JSON.parse(localStorage.getItem('pink-parrot') ?? 'null') ?? {
  rooms: {},
  messages: {},
  optimisticMessages: {},
}
const [signal, setSignal] = createSignal<MessageStore>(local)

export const messageStore = {
  getState: () => signal(),
  setState: ((x) => {
    setSignal(x)

    localStorage.setItem('pink-parrot', JSON.stringify(signal()))
  }) as Setter<MessageStore>,
}

export type MessageStoreApi = typeof messageStore
export const useMessageStore = signal;

export function getMessages(messageIdList: string[]) {
  const { optimisticMessages, messages } = messageStore.getState()

  return messageIdList
    .map((id) => optimisticMessages[id] ?? messages[id] ?? null)
    .filter((message) => message != null)
}

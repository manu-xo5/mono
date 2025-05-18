import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

export const messageStore = create<MessageStore>()(
  persist(
    () => ({
      rooms: {},
      messages: {},
      optimisticMessages: {},
    }),
    { name: 'message-store' },
  ),
)

export type MessageStoreApi = typeof messageStore
export const useMessageStore = messageStore

export function getMessages(messageIdList: string[]) {
  const { optimisticMessages, messages } = messageStore.getState()

  return messageIdList
    .map((id) => optimisticMessages[id] ?? messages[id] ?? null)
    .filter((message) => message != null)
}

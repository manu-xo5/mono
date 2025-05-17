import {create } from 'zustand'

export type RoomId = string
export type MessageId = string
export type Message = {
  id: MessageId
  type: 'text'
  text: string
  status: null | 'ok' | 'fail'
}

export type MessagesRecord = Record<MessageId, Message>

type MessageStore = {
  rooms: {
    [roomId: RoomId]: MessageId[]
  }
  messagesRecord: MessagesRecord
}
export const messageStore = create<MessageStore>()(() => ({
  rooms: {},
  messagesRecord: {},
}))
export type MessageStoreApi = typeof messageStore
export const useMessageStore = messageStore;

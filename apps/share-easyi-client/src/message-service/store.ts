import {  createStore, unwrap } from 'solid-js/store'
import { INITIAL_VALUE, LOCAL_STORAGE_NAME } from './constants'
import { messageSync } from './sync'
import type {SetStoreFunction} from 'solid-js/store';
import type {Setter} from 'solid-js';

export type RoomId = string
export type MessageId = string
export type Message = {
  id: MessageId
  type: 'text'
  text: string
  status: null | 'ok' | 'fail'
  from: string
  to: string
  roomId: string
  updatedAt: string
}

export type MessagesRecord = Record<MessageId, Message>

export type MessageStore = {
  rooms: {
    [roomId: RoomId]: Array<MessageId>
  }
  messages: MessagesRecord
  optimisticMessages: MessagesRecord
}

export type AuthUser = {
  id: string
  name: string
  email: string
  image: string
}

export const local =
  JSON.parse(localStorage.getItem(LOCAL_STORAGE_NAME) ?? 'null') ??
  INITIAL_VALUE

const [messageStore, _setMessageStore] = createStore<MessageStore>(local)
// @ts-ignore
const setMessageStore: SetStoreFunction<MessageStore> = (...x) => {
  // @ts-ignore
  _setMessageStore(...x)

  const store = unwrap(messageStore)
  messageSync.write(store)
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

export {
  messageStore,
  roomStore,
  _setMessageStore,
  setMessageStore,
  setRoomStore,
}

export const messageStore__ = {
  setState: ((x) => {
    setMessageStore(x)

    localStorage.setItem('pink-parrot', JSON.stringify(messageStore))
  }) as Setter<MessageStore>,
}

export type MessageStoreApi = typeof messageStore
export const useMessageStore = messageStore

export function getMessages(messageIdList: Array<string>) {
  const { optimisticMessages, messages } = messageStore

  return messageIdList
    .map((id) => messages[id] ?? optimisticMessages[id] ?? null)
    .filter((message) => message != null)
}

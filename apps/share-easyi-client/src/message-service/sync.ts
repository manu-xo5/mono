import { fetchRoomMessages } from './api'
import { INITIAL_VALUE, LOCAL_STORAGE_NAME } from './constants'
import type { MessageStore, RoomId } from './store'
import { safeParse } from '@/utils/utils'
import { appendDistinct } from '@/utils/list.utils'

let syncPromise: Promise<MessageStore> | null = null
const updateQueue: Array<MessageStore> = []

export function isSyncing() {
  return !!syncPromise
}

const read = (): MessageStore => {
  const [data, ok] = safeParse(
    localStorage.getItem(LOCAL_STORAGE_NAME) ?? 'null',
  )

  if (!ok) return INITIAL_VALUE

  return data as MessageStore
}

async function write(state: Partial<MessageStore>) {
  const newState = {
    ...read(),
    ...state,
  }

  if (isSyncing()) {
    updateQueue.push(newState)
    return
  }

  localStorage.setItem(LOCAL_STORAGE_NAME, JSON.stringify(newState))
}

async function sync(roomIds: Array<RoomId>): Promise<MessageStore> {
  if (syncPromise) return syncPromise

  const { messages, rooms } = read()
  const { promise, resolve } = Promise.withResolvers<MessageStore>()

  syncPromise = promise

  for (const roomId of roomIds) {
    const lastMessageId = rooms[roomId].at(-1) ?? ''

    const updatedMessages = await fetchRoomMessages(roomId, {
      afterUpdatedAt: messages[lastMessageId].updatedAt,
    })

    Object.assign(messages, updatedMessages.record)
    appendDistinct(
      rooms[roomId],
      updatedMessages.list.map((msg) => msg.id),
    )
  }

  const newState = updateQueue.reduce(
    (acc, next) => Object.assign(acc, next),
    {} as MessageStore,
  )

  Object.assign(newState, {
    ...read(),
    rooms: rooms,
    messages: {
      ...messages,
    },
  })

  localStorage.setItem(LOCAL_STORAGE_NAME, JSON.stringify(newState))

  resolve(newState)
  syncPromise = null

  return newState
}

export const messageSync = {
  read,
  write,
  sync,
  isSyncing,
}

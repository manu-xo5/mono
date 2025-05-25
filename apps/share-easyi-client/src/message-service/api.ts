import { API_VX } from '@/api'
import type { Message, MessageId, MessagesRecord } from './store'
import { messageStore } from './store'
import { unwrap } from 'solid-js/store'
import { messagesActions } from '.'

export async function fetchRooms() {
  const storedRooms = Object.keys(messageStore.rooms)

  const res = await API_VX('/room/all')
  const json = await res.json()
  const allRooms = json.ok as { roomId: string }[]

  const newRooms = allRooms.filter((room) => !storedRooms.includes(room.roomId))

  return {
    all: allRooms,
    exisintg: storedRooms,
    new: newRooms,
  }
}

export async function flushUnsentMessage() {
  const messages = Object.values(unwrap(messageStore.optimisticMessages))
  if (messages.length === 0) return

  const res = await API_VX('/message/send', {
    method: 'POST',
    body: JSON.stringify(messages),
  })

  const messagesRes = await res.json().then((json) => json.ok as Message[])
  messagesRes.forEach((message) => {
    messagesActions.moveToPersistStorage(message.id)
  })

  console.log('optimisticMessages', unwrap(messageStore.optimisticMessages))
}

export async function fetchRoomMessages(
  roomId: string,
  { afterUpdatedAt }: { afterUpdatedAt?: string } = {},
) {
  const filters: [string, string][] = []

  filters.push(['roomId', roomId])
  if (afterUpdatedAt) {
    filters.push(['afterUpdatedAt', afterUpdatedAt])
  }

  const qp = new URLSearchParams(filters).toString()

  const res = await API_VX('/message/byRoomId?' + qp)

  if (!res.ok) return {
    list: [],
    record: {},
  }

  const newMessages = ((await res.json()).ok as any[]).map(
    (msg): Message => ({
      type: msg.type,
      text: msg.body,
      id: msg.id,
      status: 'ok',
      from: msg.from,
      to: msg.to,
      roomId: msg.roomId,
      updatedAt: msg.updatedAt,
    }),
  )

  const newMessagesRecord = newMessages.reduce(
    (acc, msg) => Object.assign(acc, { [msg.id]: msg }),
    {} as Record<MessageId, Message>,
  )

  return {
    list: newMessages,
    record: newMessagesRecord,
  }
}

export async function syncRoomMessages(roomId: string) {
  const { messages, rooms } = messageStore
  const lastMessageId = rooms[roomId]?.at(-1)
  const lastMessage = lastMessageId ? messages[lastMessageId] : undefined
  const filters: [string, string][] = []

  filters.push(['roomId', roomId])
  if (lastMessage) {
    filters.push(['afterUpdatedAt', lastMessage.updatedAt])
  }

  const qp = new URLSearchParams(filters).toString()

  const res = await API_VX('/message/byRoomId?' + qp)

  if (!res.ok) {
    return {
      ids: [],
      records: {},
    }
  }
  const newMessages = await res
    .json()
    .then((json) => json.ok as any[])
    .catch(() => [])

  const newMessageIds = newMessages.map((msg) => msg.id as string)
  const newMessageRecords = newMessages
    .map(
      (msg): Message => ({
        type: msg.type,
        text: msg.body,
        id: msg.id,
        status: 'ok',
        from: msg.from,
        to: msg.to,
        roomId: msg.roomId,
        updatedAt: msg.updatedAt,
      }),
    )
    .reduce((acc, msg) => ({ ...acc, [msg.id]: msg }), {} as MessagesRecord)

  return {
    ids: newMessageIds,
    records: newMessageRecords,
  }
}

import { API_VX } from '@/api'
import type { Message, MessagesRecord } from './store'
import { messageStore } from './store'

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

export async function fetchNewMessages(roomId: string) {
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
        updatedAt: msg.updatedAt,
      }),
    )
    .reduce((acc, msg) => ({ ...acc, [msg.id]: msg }), {} as MessagesRecord)

  return {
    ids: newMessageIds,
    records: newMessageRecords,
  }
}

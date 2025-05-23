import type { MessageId, Message, RoomId } from './store'
import { messageStore, setMessageStore } from './store'
import { nanoid } from 'nanoid'

export function appendMessageIds__(
  roomId: RoomId,
  ...messageId: MessageId[]
): MessageId[] {
  const room = messageStore.rooms[roomId]

  if (!room) {
    return []
  }

  const uniqueIds = messageId.filter((msgId) => !room.includes(msgId))

  return room.concat(uniqueIds)
}

export function addToStorage(value: Message[]) {
  const messages: Record<string, Message> = {}

  for (const message of value) {
    messages[message.id] = message
  }

  setMessageStore('messages', messages)
}

export function moveToPersistStorage(msgId: string) {
  const message = messageStore.optimisticMessages[msgId]
  if (!message) return

  setMessageStore('messages', { [msgId]: { ...message, status: 'ok' } })
  setMessageStore('optimisticMessages', { [msgId]: undefined! })
}

export function newMessage(roomId: RoomId, msg: Omit<Message, 'id'>) {
  const id = nanoid()
  const message: Message = { id, ...msg }

  setMessageStore('optimisticMessages', {
    [id]: message,
  })

  setMessageStore('rooms', {
    [roomId]: appendMessageIds__(roomId, message.id),
  })

  return message
}

export function upsertRoomIds(roomIds: RoomId[]) {
  const existingRoomIds = Object.keys(messageStore.rooms)
  const uniqueRoomIds = roomIds.filter((id) => !existingRoomIds.includes(id))

  const roomsRecord = Object.fromEntries<MessageId[]>(
    uniqueRoomIds.map((id) => [id, []]),
  )

  setMessageStore('rooms', roomsRecord)
}

export function appendMessageIds(roomId: RoomId, messageIds: MessageId[]) {
  const existingMessageIds = messageStore.rooms[roomId]
  if (!existingMessageIds)
    return console.log('error: existingMessageIds not found')
  const uniqueIds = messageIds.filter(
    (msgId) => !existingMessageIds.includes(msgId),
  )

  setMessageStore('rooms', roomId, (prev) => prev.concat(uniqueIds))
}

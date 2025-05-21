import type { MessageId, Message, RoomId } from './store'
import { messageStore, setMessageStore } from './store'
import { nanoid } from 'nanoid'

export function appendMessageIds(
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
    [roomId]: appendMessageIds(roomId, message.id),
  })

  return message
}

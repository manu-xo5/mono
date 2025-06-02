import { nanoid } from 'nanoid'
import { messageStore, setMessageStore } from './store'
import type { Message, MessageId, RoomId } from './store'
import type { MessageReceiveEvent } from '@/types'

export function appendMessageIds__(
  roomId: RoomId,
  ...messageId: Array<MessageId>
): Array<MessageId> {
  const room = messageStore.rooms[roomId]

  if (!room) {
    return []
  }

  const uniqueIds = messageId.filter((msgId) => !room.includes(msgId))

  return room.concat(uniqueIds)
}

export function addToStorage(value: Array<Message>) {
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

export function upsertRoomIds(roomIds: Array<RoomId>) {
  const existingRoomIds = Object.keys(messageStore.rooms)
  const uniqueRoomIds = roomIds.filter((id) => !existingRoomIds.includes(id))

  const roomsRecord = Object.fromEntries<Array<MessageId>>(
    uniqueRoomIds.map((id) => [id, []]),
  )

  setMessageStore('rooms', roomsRecord)
}

export function appendMessageIds(
  roomId: RoomId,
  messageIds: Array<MessageId>,
  start?: number,
) {
  const existingMessageIds = messageStore.rooms[roomId]
  if (!existingMessageIds) {
    console.log('error: existingMessageIds not found')
    return
  }
  const uniqueIds = messageIds.filter(
    (msgId) => !existingMessageIds.includes(msgId),
  )

  if (start != null) {
    setMessageStore('rooms', roomId, (prev) =>
      prev.toSpliced(start, 0, ...uniqueIds),
    )
  } else {
    setMessageStore('rooms', roomId, (prev) => prev.concat(uniqueIds))
  }
}

export function handleNewMessage(msg: MessageReceiveEvent) {
  const body = msg.body

  addToStorage([
    {
      id: body.id,
      type: body.type,
      text: body.body,
      status: 'ok',
      from: body.from,
      to: body.to,
      roomId: msg.roomId,
      updatedAt: body.updatedAt,
    },
  ])

  appendMessageIds(msg.roomId, [body.id])
}

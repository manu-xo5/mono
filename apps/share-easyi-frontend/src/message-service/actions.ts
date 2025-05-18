import { Message, MessageId, messageStore, RoomId } from './store'
import { nanoid } from 'nanoid'

export function appendMessageIds(
  roomId: RoomId,
  ...messageId: MessageId[]
): MessageId[] {
  const { rooms } = messageStore.getState()
  const room = rooms[roomId]

  if (!room) {
    return []
  }

  const uniqueIds = messageId.filter((msgId) => !room.includes(msgId))

  return room.concat(uniqueIds)
}

export function addToStorage(value: Message) {
  const store = messageStore.getState()

  store.messages[value.id] = value

  messageStore.setState({ ...store })
}

export function moveToPersistStorage(msgId: string) {
  const { messages, optimisticMessages } = messageStore.getState()
  const message = optimisticMessages[msgId]

  if (!message) return

  messages[msgId] = { ...message, status: 'ok' }
  delete optimisticMessages[msgId]

  console.log(messages)
  console.log(messages[msgId])

  messageStore.setState({ ...{ messages, optimisticMessages } })
}

export function newMessage(
  roomId: RoomId,
  msg: Omit<Message, 'id'>,
) {
  const { optimisticMessages, rooms } = messageStore.getState()

  const id = nanoid()

  const message: Message = { id, ...msg }

  optimisticMessages[id] = message
  rooms[roomId] = appendMessageIds(roomId, id)

  messageStore.setState({ ...{ optimisticMessages, rooms } })

  return message
}

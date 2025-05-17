import { Message, MessageId, messageStore, RoomId } from './store'

function appendMessageId(roomId: RoomId, messageId: MessageId): MessageId[] {
  const { rooms } = messageStore.getState()

  if (!rooms[roomId]) {
    return []
  }

  if (rooms[roomId].includes(messageId)) {
    return rooms[roomId]
  }

  return rooms[roomId].concat(messageId)
}

export function updateMessage(
  msgId: MessageId,
  values: Partial<Omit<Message, 'id'>>,
) {
  const { messagesRecord } = messageStore.getState()

  const message = messagesRecord[msgId]
  if (!message) {
    return
  }

  messagesRecord[msgId] = Object.assign({}, message, values)
  messageStore.setState({ messagesRecord: { ...messagesRecord } })
}

export function updateMessageId(currentId: MessageId, newId: MessageId) {
  const { messagesRecord, rooms } = messageStore.getState()

  const message = messagesRecord[currentId]
  if (!message) {
    return
  }

  messagesRecord[newId] = { ...message }

  for (const roomMessages of Object.values(rooms)) {
    for (let i = 0; i < roomMessages.length; i++) {
      if (roomMessages[i] === currentId) {
        roomMessages[i] = newId
      }
    }
  }

  delete messagesRecord[currentId]

  messageStore.setState((prev) =>
    Object.assign({}, prev, { messagesRecord, rooms }),
  )
}

export function overwriteMessage(roomId: RoomId, values: Message) {
  const { rooms, messagesRecord } = messageStore.getState()

  messagesRecord[values.id] = values

  rooms[roomId] = appendMessageId(roomId, values.id)

  messageStore.setState((prev) =>
    Object.assign({}, prev, { messagesRecord, rooms }),
  )
}

// TODO: remove id?: string
export function newMessage(
  roomId: RoomId,
  msg: Omit<Message, 'id'> & { id?: string },
) {
  const { messagesRecord, rooms } = messageStore.getState()

  console.log(msg)
  let id: string | null =
    msg.id ??
    (() => {
      let newId: string | null = crypto.randomUUID()
      let i = 0
      while (newId in messagesRecord) {
        if (i > 100) {
          newId = null
          break
        }
        newId = crypto.randomUUID()
      }
      return newId
    })()

  if (id == null) {
    return null
  }

  const message: Message = {
    id: id,
    ...msg,
  }

  messagesRecord[id] = message
  rooms[roomId] = (rooms[roomId] ?? []).concat(id)
  messageStore.setState({
    messagesRecord: { ...messagesRecord },
    rooms: { ...rooms },
  })

  return message
}

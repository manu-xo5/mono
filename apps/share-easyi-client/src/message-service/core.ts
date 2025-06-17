import type { TRestApi } from '@/api'
import type { TConversationId } from './domain/conversation'
import type { TMessage, TMessageId } from './domain/message'
import { Observable } from '@/shared/observable'

type TSendMessage = (message: TMessage) => Promise<void>
// const sendMessage: TSendMessage = (message: TMessage) => {
// ws.send(
//   JSON.stringify({
//     id: msg.id,
//     type: msg.type,
//     body: {
//       to: toUser,
//       from: user.id,
//       text: msg.text,
//     },
//   }),
// )
// }

export async function fetchRooms(restApi: TRestApi) {
  const res = await restApi('/room/all')
  const json = await res.json()

  return json.ok as Array<{ roomId: string }>
}

export class ConversationApi {
  private messages: Record<TMessageId, TMessage> = {}
  private messagesIds = new Observable<Array<TMessageId>>([])

  constructor(
    public conversationId: TConversationId,
    public sendMessage: TSendMessage,
  ) {}

  private async writeTextMessage(message: TMessage) {
    if (message.status !== 'pending') return
    if (message.type !== 'text') return

    this.messages[message.id] = message
    this.messagesIds.notify(this.messagesIds.getValue().concat(message.id))
    const res = this.sendMessage(message)
    if ('error' in res) {
      throw new Error(`Message::SendFailed`)
    }

    return Promise.resolve(void 0)
  }

  private sync() {
    /* Implement the logic to sync messages */
  }

  private postMessages(messages: Array<TMessage>) {}

  write(message: TMessage): void {
    switch (message.type) {
      case 'text': {
        this.writeTextMessage(message)
        break
      }
      case 'image': {
        throw new Error('Image messages are not supported yet')
      }

      default: {
        throw new Error(`Unsupported message type: ${message.type}`)
      }
    }
  }
}

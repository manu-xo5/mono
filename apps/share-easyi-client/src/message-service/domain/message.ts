import { nanoid } from 'nanoid'

export type TMessageId = ReturnType<typeof MessageId>
export function MessageId() {
  return nanoid()
}

export type TMessage = ReturnType<typeof Message>
export function Message({
  type,
  id,
  body,
  status,
  from,
  to,
  updatedAt,
}: {
  id: TMessageId
  type: 'text' | 'image'
  body: string
  status: 'ok' | 'pending' | 'error'
  from: string
  to: string
  updatedAt: string
}) {
  return {
    type,
    text: body,
    id,
    status,
    from,
    to,
    updatedAt,
  }
}

export function NewTextMessage({
  body,
  to,
  from,
}: {
  body: string
  from: string
  to: string
}): TMessage {
  return Message({
    type: 'text',
    id: MessageId(),
    body,
    status: 'pending',
    from,
    to,
    updatedAt: new Date().toISOString(),
  })
}

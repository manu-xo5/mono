import { cn } from '@/lib/utils'
import { Message } from '@/message-service/store'
import { ComponentRef } from 'react'

export function MessageList({
  ref,
  className,
  messages,
}: {
  className?: string
  ref?: React.Ref<ComponentRef<'ul'>>
  messages: Message[]
}) {
  return (
    <ul ref={ref} className={cn('w-full overflow-auto', className)}>
      {messages.map((msg) => (
        <li key={msg.id}>
          {msg.text}
          {msg.status == null ? '[ ]' : { ok: '[x]', fail: '[!]' }[msg.status]}
        </li>
      ))}
    </ul>
  )
}

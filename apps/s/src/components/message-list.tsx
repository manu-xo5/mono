import { cn } from '@/lib/utils'
import type { Message } from '@/message-service/store'
import { For } from 'solid-js'

export function MessageList(props: { class?: string; messages: Message[] }) {
  return (
    <ul class={cn('w-full overflow-auto', props.class)}>
      <For each={props.messages}>
        {(msg) => (
          <li>
            {msg.text}
            {msg.status == null
              ? '[ ]'
              : { ok: '[x]', fail: '[!]' }[msg.status]}
          </li>
        )}
      </For>
    </ul>
  )
}

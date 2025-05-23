import { authClient } from '@/auth'
import { cn } from '@/lib/utils'
import type { Message } from '@/message-service/store'
import { For } from 'solid-js'

function SimpleMessageIndicator(props: { message: Message }) {
  const authSession = authClient.useSession()
  const me = () => authSession().data?.user

  return (
    <span
      class={cn(
        'absolute bottom-0.5 w-3 h-0.5',
        me()?.id === props.message.from ? 'right-3.5' : 'left-3.5',
        props.message.status == null
          ? 'bg-black/50 animate-spin'
          : { ok: 'bg-primary', fail: 'bg-red-900' }[props.message.status],
      )}
    />
  )
}

export function MessageList(props: { class?: string; messages: Message[] }) {
  const authSession = authClient.useSession()
  const me = () => authSession().data?.user

  return (
    <ul class={cn('w-full overflow-auto py-2', props.class)}>
      <For each={props.messages}>
        {(msg) => (
          <li class="py-2 flex">
            <div
              class={cn(
                'rounded-full px-4 py-1 bg-muted inline-block animate-in fade-in duration-1000 relative',
                me()?.id === msg.from ? 'ml-auto' : '',
              )}
            >
              {msg.text}

              <SimpleMessageIndicator message={msg} />
            </div>
          </li>
        )}
      </For>
    </ul>
  )
}

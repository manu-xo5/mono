import { authClient } from '@/auth'
import { cn } from '@/lib/utils'
import type { Message } from '@/message-service/store'
import { CheckIcon, CircleXIcon, Clock7Icon } from 'lucide-solid'
import { For } from 'solid-js'

function SimpleMessageIndicator(props: { message: Message }) {
  return (
    <span class={cn('absolute bottom-[3px] right-1.5')}>
      {props.message.status == null ? (
        <Clock7Icon size={12} />
      ) : (
        { ok: <CheckIcon size={12} />, fail: <CircleXIcon /> }[
          props.message.status
        ]
      )}
    </span>
  )
}

export function MessageList(props: {
  ref?: HTMLUListElement
  class?: string
  messages: Message[]
}) {
  const authSession = authClient.useSession()
  const me = () => authSession().data?.user

  return (
    <ul
      ref={props.ref}
      class={cn('w-full overflow-auto py-2 pr-2', props.class)}
    >
      <For each={props.messages}>
        {(msg) => (
          <li class="py-2 flex">
            <div
              class={cn(
                'rounded-lg py-1 pl-2 pr-6 bg-secondary inline-block animate-in fade-in duration-1000 relative border-b',
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

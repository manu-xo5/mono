import { Show } from 'solid-js'
import { Flexbox } from './ui/flex'
import { CallButton } from '../call-service/components/call-button'
import type { AuthUser } from '@/message-service/store'

export function RoomHeader(props: { otherUser: AuthUser | null }) {
  return (
    <Flexbox class="w-full h-16 px-6 gap-3 border-b">
      <span class="border-white/20 border bg-background rounded-full overflow-hidden size-10 inline-block">
        <Show when={props.otherUser != null}>
          <img
            loading="eager"
            width={40}
            height={40}
            src={props.otherUser!.image}
            referrerPolicy="no-referrer"
          />
        </Show>

        <Show when={props.otherUser == null}>
          <span class="inline-block size-full" />
        </Show>
      </span>

      <p class="relative top-[-1px]">{props.otherUser?.name ?? 'Unknown'}</p>

      <div class="ml-auto">
        <CallButton otherUserId={props.otherUser?.id} />
      </div>
    </Flexbox>
  )
}

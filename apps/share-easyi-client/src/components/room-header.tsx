import { Auth } from '@/auth'
import { callActions } from '@/call-service/actions'
import { Button } from '@/components/ui/button'
import type { AuthUser } from '@/message-service/store'
import { Socket } from '@/web-socket'
import { run } from 'effection'
import { Show } from 'solid-js'
import { Icons } from './icons'
import { Flexbox } from './ui/flex'

export function RoomHeader(props: { otherUser: AuthUser | null }) {
  const me = Auth.getUser()
  const ws = Socket.get()

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
        <Button
          size="icon"
          variant="ghost"
          onClick={async () => {
            const otherUser = props.otherUser
            if (!otherUser) return

            await run(function* () {
              yield* callActions.makeCall({
                ws,
                to: otherUser.id,
                from: me.id,
              })
            })
          }}
        >
          <Icons.PhoneCall />
        </Button>
      </div>
    </Flexbox>
  )
}

import { Stack } from './ui/stack'
import { Button } from './ui/button'
import { For } from 'solid-js'
import { useNavigate, useRouter } from '@tanstack/solid-router'
import { signOutUser } from '@/auth'
import { Input } from './ui/input'

import type { AuthSession } from '@/auth'

const extractUserId = (roomId: string, userId: string) =>
  roomId.split('-').find((id) => id != userId)!

export function Sidebar(props: {
  conversationIds: string[]
  user: AuthSession['user']
}) {
  const navigate = useNavigate({ from: '/home' })
  const router = useRouter()

  function navigateToRoom(roomId: string) {
    navigate({
      to: '/home/$roomId',
      params: {
        roomId: roomId,
      },
      mask: {
        to: '/home',
      },
    })
  }

  return (
    <Stack class="bg-card border-r p-3 gap-3">
      <Input
        placeholder="User Id"
        onKeyDown={(ev) => {
          if (ev.key !== 'Enter') return
          const value = ev.currentTarget.value

          navigateToRoom(value)
        }}
      />

      <Button
        class="w-full"
        variant="destructive"
        onClick={async () => {
          signOutUser()
          router.invalidate()
        }}
      >
        Sign out
      </Button>

      <ul class="divide-y border-b flex flex-col w-full">
        <For each={props.conversationIds}>
          {(addr) => (
            <li class="w-full py-1">
              <Button
                variant="ghost"
                class="flex justify-start items-center p-3 gap-3 h-auto w-full"
                onClick={() => navigateToRoom(addr)}
              >
                <span class="size-10 border-white/20 border bg-black rounded-full" />

                <Stack class="flex-1">
                  {(() => {
                    const otherUserId = extractUserId(addr, props.user.id)

                    return otherUserId.length > 20
                      ? otherUserId.substring(0, 17).concat('...')
                      : otherUserId
                  })()}

                  <span class="text-xs text-muted-foreground pointer-events-none">
                    Lorem Ipsume text sample
                  </span>
                </Stack>
              </Button>
            </li>
          )}
        </For>
      </ul>
    </Stack>
  )
}

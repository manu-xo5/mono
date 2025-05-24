import { authClient, signOutUser } from '@/auth'
import { useNavigate, useRouter } from '@tanstack/solid-router'
import { For } from 'solid-js'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Stack } from './ui/stack'

import { setCallStore } from '@/call-service/store'
import { roomStore } from '@/message-service/store'

export function Sidebar() {
  const navigate = useNavigate({ from: '/home' })
  const router = useRouter()
  const authSession = authClient.useSession()
  const conversationIds = () => Object.keys(roomStore)

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
    <Stack class="bg-sidebar border-r p-3 gap-3">
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

      <Button
        class="w-full"
        variant="secondary"
        onClick={async () => {
          setCallStore({
            id: '',
            status: 'on-call',
          })
        }}
      >
        Call Dialog
      </Button>

      <ul class="divide-y border-b flex flex-col w-full">
        <For each={conversationIds()}>
          {(addr) => {
            const currentUser = authSession().data?.user.id
            const room = roomStore[addr]
            const otherUser =
              currentUser === room.user1 ? room.user2Data : room.user1Data

            return (
              <li class="w-full py-1">
                <Button
                  variant="ghost"
                  class="flex justify-start items-center p-3 gap-3 h-auto w-full"
                  onClick={() => navigateToRoom(addr)}
                >
                  <img
                    loading="eager"
                    class="size-10 border-white/20 border bg-black rounded-full"
                    src={otherUser.image}
                    referrerPolicy="no-referrer"
                  />

                  <Stack class="flex-1">
                    {otherUser.name}

                    <span class="text-xs text-muted-foreground pointer-events-none">
                      Lorem Ipsume text sample
                    </span>
                  </Stack>
                </Button>
              </li>
            )
          }}
        </For>
      </ul>
    </Stack>
  )
}

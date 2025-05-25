import { authClient, signOutUser } from '@/auth'
import { useNavigate, useParams, useRouter } from '@tanstack/solid-router'
import { For } from 'solid-js'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Stack } from './ui/stack'

import { setCallStore } from '@/call-service/store'
import { roomStore } from '@/message-service/store'
import { cn } from '@/utils'
import { Flexbox } from './ui/flex'

export function Sidebar() {
  const navigate = useNavigate({ from: '/home' })
  const params = useParams({ strict: false })
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
    <Stack class="bg-[url(/bg1.webp)]">
      <Flexbox class="h-16 w-full border-b border-r backdrop-blur-md p-3">
        <Input
          placeholder="User Id"
          onKeyDown={(ev) => {
            if (ev.key !== 'Enter') return
            const value = ev.currentTarget.value

            navigateToRoom(value)
          }}
        />
      </Flexbox>

      <Stack class="backdrop-blur-md flex-1 min-h-0 border-r p-3 gap-3">
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
              const isActive = () => params().roomId == addr
              const currentUser = authSession().data?.user.id
              const room = roomStore[addr]
              const otherUser =
                currentUser === room.user1 ? room.user2Data : room.user1Data

              return (
                <li class="w-full py-1">
                  <Button
                    variant="ghost"
                    class={cn(
                      'flex justify-start items-center p-3 gap-3 h-auto w-full hover:bg-transparent',
                      isActive()
                        ? 'bg-popover hover:bg-popover text-primary-foreground'
                        : '',
                    )}
                    onClick={() => navigateToRoom(addr)}
                  >
                    <img
                      loading="eager"
                      class={cn(
                        'size-10 border rounded-full',
                        isActive() ? 'border-white' : '',
                      )}
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
    </Stack>
  )
}

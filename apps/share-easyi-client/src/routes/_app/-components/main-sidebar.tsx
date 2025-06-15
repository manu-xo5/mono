import { useNavigate, useParams, useRouter } from '@tanstack/solid-router'
import { For } from 'solid-js'
import {
  Avatar,
  Button,
  Flexbox,
  Icons,
  Input,
  Stack,
} from '@/shared/components'
import { cn } from '@/utils/utils'
import { roomStore } from '@/message-service/store'
import { Auth } from '@/auth'

export function Sidebar() {
  const navigate = useNavigate({ from: '/home' })
  const params = useParams({ strict: false })
  const router = useRouter()
  const user = Auth.getUser()
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
    <Stack class="bg-[url(/bg1.webp)] border-r">
      <Flexbox class="h-16 w-full border-b backdrop-blur-md p-3">
        <Input
          placeholder="User Id"
          onKeyDown={(ev) => {
            if (ev.key !== 'Enter') return
            const value = ev.currentTarget.value

            navigateToRoom(value)
          }}
        />
      </Flexbox>

      <Stack class="backdrop-blur-md flex-1 min-h-0 p-3 gap-3">
        <Button
          class="w-full"
          variant="destructive"
          onClick={async () => {
            Auth.signOut()
            router.invalidate()
          }}
        >
          Sign out
        </Button>

        <ul class="divide-y border-b flex flex-col w-full">
          <For each={conversationIds()}>
            {(addr) => {
              const isActive = () => params().roomId == addr
              const currentUser = user.id
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

      <div class="w-full p-3">
        <Button class="w-full" variant="secondary">
          <Avatar class="shrink-0" src={Auth.getUser().image!} />
          <Stack>
            <p class="text-base">{Auth.getUser().name}</p>

            <p class="text-m">
              {Auth.getUser().id.substring(0, 10)}...
              <button
                class="ml-3"
                onClick={(ev) => {
                  ev.preventDefault()
                  ev.stopPropagation()

                  navigator.clipboard.writeText(Auth.getUser().id)
                }}
              >
                <Icons.Copy class="!size-3" />
              </button>
            </p>
          </Stack>
        </Button>
      </div>
    </Stack>
  )
}

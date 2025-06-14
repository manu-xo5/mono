import { createFileRoute } from '@tanstack/solid-router'
import { createEffect, createSignal } from 'solid-js'
import { Auth } from '@/auth'
import { MessageList } from '@/components/message-list'
import { RoomHeader } from '@/components/room-header'
import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'
import { getMessages, messageStore, roomStore } from '@/message-service/store'

export const Route = createFileRoute('/_app/home/$roomId/')({
  component: RouteComponent,
})

function RouteComponent() {
  let messageDiv!: undefined | HTMLUListElement
  const params = Route.useParams()
  const user = Auth.getUser()

  const [messageInput, setMessageInput] = createSignal('')

  const userId = user.id
  const messages = () => getMessages(messageStore.rooms[params().roomId] ?? [])

  const otherUserId = () =>
    params()
      .roomId.split('-')
      .find((id) => id != userId)!

  void otherUserId()

  const otherUserData = () => {
    const room = roomStore[params().roomId]

    return room.user1 === userId ? room.user2Data : room.user1Data
  }

  createEffect(() => {
    void messages()
    messageDiv?.scrollTo({ top: 9999, behavior: 'instant' })
  })

  function scrollToBottom() {
    window.requestIdleCallback(
      () => {
        messageDiv?.scrollTo({ top: 9999, behavior: 'smooth' })
      },
      { timeout: 500 },
    )
  }

  return (
    <Stack class="relative min-h-0">
      <RoomHeader otherUser={otherUserData()} />

      <Stack class="flex-1 min-h-0 px-3 pb-3">
        <MessageList ref={messageDiv} class="grow" messages={messages()} />

        <div class="grid grid-cols-[1fr_auto] w-full border border-zinc-800 dark:bg-transparent py-2 px-3 rounded-lg">
          <textarea
            rows={2}
            class="w-full resize-none outline-none"
            placeholder="Send a message (Ctrl+Enter for new line)"
            value={messageInput()}
            onInput={(ev) => setMessageInput(ev.currentTarget.value)}
            onKeyDown={(ev) => {
              if (ev.key !== 'Enter') return
              ev.preventDefault()
              if (ev.ctrlKey) {
                setMessageInput((prev) => prev + '\n')
                return
              }

              const value = messageInput()
              // messageInputRef.current?.focus()
              if (!value) return

              setMessageInput('')
              throw new Error('not implemented')

              // EEmit('message:send', {
              //   body: value,
              //   toUser: otherUserId(),
              //   roomId: params().roomId,
              // })

              scrollToBottom()
            }}
          />

          <div class="self-end">
            <Button
              size="sm"
              onClick={() => {
                const value = messageInput()
                if (!value) return
                setMessageInput('')
                throw new Error('not implemented')

                // EEmit('message:send', {
                //   body: value,
                //   toUser: otherUserId(),
                //   roomId: params().roomId,
                // })

                scrollToBottom()
              }}
            >
              Send
            </Button>
          </div>
        </div>
      </Stack>
    </Stack>
  )
}

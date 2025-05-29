import type { AuthSession } from '@/auth'
import type { Event } from '@/types'
import { safeParse } from '@/utils'
import { run } from 'effection'
import { handleCallRequest } from './handler'

export async function callHandler({
  user,
  socket,
  msg,
}: {
  user: AuthSession['user']
  socket: WebSocket
  msg: MessageEvent
}) {
  const [data, ok] = safeParse(msg.data)
  if (!ok) return
  const parsedData = data as Event

  switch (parsedData.type) {
    case 'make-call-request':
      run(function* () {
        yield* handleCallRequest({ user, ws: socket, msg: parsedData })
      })
      break
  }
}

import type { Event } from '@/types'
import { safeParse } from '@/utils'
import { callActions } from './actions'

export function callWsMiddleware(ws: WebSocket) {
  ws.addEventListener('message', (ev) => {
    const [parsedMessage, ok] = safeParse<Event>(ev.data)
    if (!ok) return

    switch (parsedMessage.type) {
      case 'make-call-request': {
        callActions.handleIncoming(parsedMessage)
        break
      }

      // channel for generic message/data exchange
      case 'call-message': {
        throw Error("todo handle call-message generic channel")
      }
    }
  })
}

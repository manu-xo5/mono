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
        console.warn("call-message generic channel's handler is empty")
      }
    }
  })
}

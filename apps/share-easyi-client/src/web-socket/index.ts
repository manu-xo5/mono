import { EEmit } from '@/event-bus/emitter'

let cachedSocket: WebSocket | null = null

async function init() {
  if (cachedSocket) {
    return true
  }

  const socket = new WebSocket(import.meta.env.VITE_SERVER_BASE + '/ws')
  const { promise, resolve } = Promise.withResolvers<boolean>()

  socket.addEventListener('open', () => resolve(true))
  socket.addEventListener('message', (ev) => EEmit("ws:message", ev.data))
  socket.addEventListener('error', () => resolve(false))
  socket.addEventListener('close', () => resolve(false))
  setTimeout(() => {
    if (socket.readyState === WebSocket.OPEN) return
    resolve(false)
    socket.close()
  }, 20000)

  const success = await promise
  if (success) {
    cachedSocket = socket
  }

  return success
}

function get() {
  if (cachedSocket == null) {
    throw Error("getWebSocket can't be used before the router")
  }
  return cachedSocket
}

export const Socket = {
  init,
  get,
}

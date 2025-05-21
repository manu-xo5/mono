import { createMessageHandler } from "@/message-service"

const WEB_SOCKET_STATUS = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'] as const

let ws: WebSocket | null = null
let promise1: Promise<WebSocket | null> | null = null

export async function getWebSocket() {
  if (ws) {
    return {
      ws,
      wsStatus: WEB_SOCKET_STATUS[ws.readyState],
    }
  }

  if (promise1) {
    const ws = await promise1

    return {
      ws,
      wsStatus: WEB_SOCKET_STATUS[ws?.readyState ?? 3],
    }
  }

  const socket = new WebSocket('wss://mono-production.up.railway.app/ws')
  const { promise, resolve } = Promise.withResolvers<WebSocket | null>()
  promise1 = promise

  socket.addEventListener('open', () => resolve(socket))
  socket.addEventListener('error', () => resolve(null))
  socket.addEventListener('close', () => resolve(null))
  setTimeout(() => resolve(null), 2000)

  ws = await promise1
  promise1 = null

  if (socket.readyState === WebSocket.OPEN) {
    socket.addEventListener('message', createMessageHandler())
  }

  return {
    ws,
    wsStatus: WEB_SOCKET_STATUS[ws?.readyState ?? 3],
  }
}

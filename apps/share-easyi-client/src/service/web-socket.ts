import { CallApi } from '@/call-service'
import { CreateLogger } from '@/utils'

let cachedSocket: WebSocket | null = null
let promiseSocket: Promise<WebSocket> | null = null

const Dependent: {
  wsMiddleware: (ws: WebSocket) => void
}[] = [CallApi]

export const Socket = {
  async init() {
    if (promiseSocket) {
      return promiseSocket.then(() => true)
    }

    if (cachedSocket) {
      return true
    }

    const { promise, resolve, reject } = Promise.withResolvers<WebSocket>()
    const socket = new WebSocket(import.meta.env.VITE_SERVER_BASE + '/ws')

    socket.onopen = () => {
      resolve(socket)
      socket.onopen = null
    }
    socket.addEventListener('error', () => reject())
    socket.addEventListener('close', () => reject())

    try {
      promiseSocket = promise

      await promiseSocket
      cachedSocket = socket
      Dependent.forEach((i) => i.wsMiddleware(socket))

      return true
    } catch {
      return false
    } finally {
      promiseSocket = null
    }
  },

  get() {
    if (!cachedSocket) {
      throw new Error('Cannot use Socketx.getInstance before Socketx.init')
    }

    return cachedSocket
  },

  log: CreateLogger("Socket"),

  destory() {
    cachedSocket?.close()
    cachedSocket = null
  },
}

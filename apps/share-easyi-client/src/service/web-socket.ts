let cachedSocket: WebSocket | null = null
let promiseSocket: Promise<WebSocket> | null = null

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

      return true
    } catch {
      return false
    } finally {
      promiseSocket = null
    }
  },

  getInstance() {
    if (!cachedSocket) {
      throw new Error('Cannot use Socketx.getInstance before Socketx.init')
    }

    return cachedSocket
  },

  destory() {
    cachedSocket?.close()
    cachedSocket = null
  },
}

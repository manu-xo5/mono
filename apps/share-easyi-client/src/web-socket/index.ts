import { EEmit } from '@/event-bus/emitter'

let cachedSocket: WebSocket | null = null

async function init() {
  if (cachedSocket) {
    return true
  }

  const socket = new WebSocket(import.meta.env.VITE_SERVER_BASE + '/ws')
  const { promise, resolve } = Promise.withResolvers<boolean>()

  socket.addEventListener('open', () => resolve(true))
  socket.addEventListener('message', (ev) => EEmit('ws:message', ev.data))
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
  return Socketx.getInstance()
}

export const Socket = {
  init,
  get,
}

export class Socketx {
  private static instance: WebSocket | null
  private static promise: Promise<WebSocket> | null = null

  private constructor(instance: WebSocket) {
    Socketx.instance = instance
  }

  static async init() {
    if (Socketx.promise) {
      return true
    }

    try {
      const { promise, resolve, reject } = Promise.withResolvers<WebSocket>()
      this.promise = promise

      const socket = new WebSocket(import.meta.env.VITE_SERVER_BASE + '/ws')
      socket.onopen = () => {
        resolve(socket)
        socket.onopen = null
      }
      socket.addEventListener('error', () => reject())
      socket.addEventListener('close', () => reject())

      await this.promise;
      this.instance = socket;

      return true
    } catch {
      return false
    } finally {
      this.promise = null
    }
  }
  static getInstance() {
    if (!Socketx.instance) {
      throw new Error('Cannot use Socketx.getInstance before Socketx.init')
    }

    return Socketx.instance
  }

  static destory() {
    Socketx.instance?.close()
    Socketx.instance = null
  }
}

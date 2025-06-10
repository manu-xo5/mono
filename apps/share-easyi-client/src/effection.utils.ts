import {  race, sleep, withResolvers } from 'effection'
import { safeParse } from './utils'
import type {Operation} from 'effection';
import type TPeer from 'simple-peer'

export const ETimeoutSymbol = Symbol('EffectionTimeout')

export function* timeout(ms: number): Operation<typeof ETimeoutSymbol> {
  yield* sleep(ms)

  return ETimeoutSymbol
}

export function* peerOnce<T>(
  peer: TPeer.Instance,
  eventName: string,
  timeoutMs?: number,
) {
  const { operation, resolve } = withResolvers<T>()

  const handler = (tar: T) => {
    resolve(tar)
  }

  peer.on(eventName, handler)
  try {
    if (timeoutMs != null) {
      return yield* race([operation, timeout(timeoutMs)])
    } else {
      return yield* operation
    }
  } finally {
    peer.off(eventName, handler)
  }
}

export function* wsMsgOnce<T>(ws: WebSocket, type: string, timeoutMs?: number) {
  const { operation, resolve } = withResolvers<T>()

  const handler = (tar: MessageEvent) => {
    const [data, ok] = safeParse(tar.data)
    console.log('wsMsgOnce', data)
    if (!ok) {
      console.error('Failed to parse message:', tar.data)
      return
    }
    if (!('type' in data) || data.type !== type) {
      console.error('Failed to parse message:', tar.data)
      return
    }

    resolve(data as T)
  }

  ws.addEventListener('message', handler)
  try {
    if (timeoutMs != null) {
      return yield* race([operation, timeout(timeoutMs)])
    } else {
      return yield* operation
    }
  } finally {
    ws.removeEventListener('message', handler)
  }
}

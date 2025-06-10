import {  race, suspend, withResolvers } from 'effection'
import type {Operation} from 'effection';
import type { ETimeoutSymbol} from '@/effection.utils';
import { timeout } from '@/effection.utils'
import { safeParse } from '@/utils'

export function* untilMessageOf<T>(
  target: WebSocket,
  messageType: string,
  timeoutMs?: number,
) {
  const { operation, resolve } = withResolvers<T>()
  const timeoutOp = timeoutMs
    ? timeout(timeoutMs)
    : (suspend() as Operation<typeof ETimeoutSymbol>)

  const handler = (msg: MessageEvent<any>) => {
    const [json, ok] = safeParse(msg.data)

    if (
      ok &&
      typeof json === 'object' &&
      'type' in json &&
      json.type === messageType
    ) {
      resolve(json as T)
    }
  }
  target.addEventListener('message', handler)

  try {
    return yield* race([operation, timeoutOp])
  } finally {
    target.removeEventListener('message', handler)
  }
}

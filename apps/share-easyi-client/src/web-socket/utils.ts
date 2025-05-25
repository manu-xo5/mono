import { safeParse } from '@/utils'
import { action } from 'effection'

export function untilMessageOf<T>(target: WebSocket, messageType: string) {
  return action<T>((res) => {
    const handler = (msg: MessageEvent<any>) => {
      const [json, ok] = safeParse(msg.data)

      if (
        ok &&
        typeof json === 'object' &&
        'type' in json &&
        json.type === messageType
      ) {
        res(json as T)
      }
    }
    target.addEventListener('message', handler)

    return () => target.removeEventListener('message', handler)
  })
}

import { action, type EventList } from 'effection'

function safeParse(value: string) {
  try {
    const json = JSON.parse(value)

    if (!json) {
      return [null, false] as [data: null, ok: false]
    }

    return [json, true] as [data: {}, ok: true]
  } catch {
    return [null, false] as [data: null, ok: false]
  }
}

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

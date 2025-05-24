import { action, type Operation } from 'effection'

export const sleep = (ms: number): Operation<void> =>
  action<void>((res) => {
    const id = setTimeout(() => res(), ms)

    return () => clearTimeout(id)
  })

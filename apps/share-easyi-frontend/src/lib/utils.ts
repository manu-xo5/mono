import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

type PeerListener<Event> = {
  on: (event: Event, listener: (...args: any[]) => void) => void
  off: (event: Event, listener: (...args: any[]) => void) => void
}
export async function waitEvent<
  Event extends string,
  Target extends PeerListener<Event>,
>(target: Target, event: Event, { signal }: { signal?: AbortSignal } = {}) {
  const { promise, resolve, reject } = Promise.withResolvers<void>()

  function cleanup() {
    signal?.removeEventListener('abort', handleAbort)
    target.off(event, handleEvent)
  }

  function handleEvent() {
    cleanup()
    resolve()
  }

  function handleAbort() {
    cleanup()
    reject(new Error('Listener Aborted'))
  }

  signal?.addEventListener('abort', handleAbort)
  target.on(event, handleEvent)

  return promise
}

export function createRoomId(user1Id: string, user2Id: string) {
  return [user1Id, user2Id].sort().join("-")
}

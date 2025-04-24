import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getScreenCaptureStream() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    })

    return stream
  }
  catch (err) {
    console.error(err)
    return null
  }
}

export function createPeerId(displayName: string) {
  return `share-easyi${crypto.randomUUID()}${displayName}`
}
export function getDisplayNameFromPeerId(peerId: string) {
  const prefixLen = 'share-easyi'.length + 36
  return peerId.substring(prefixLen)
}

export class TimeoutError extends Error {}

export function timer(ms: number) {
  const promise = new Promise<void>((res) => {
    const timeoutSignal = AbortSignal.timeout(ms)
    timeoutSignal.addEventListener('abort', () => res())
  })
  return promise
}

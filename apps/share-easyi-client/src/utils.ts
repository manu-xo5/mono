import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { ClassValue } from 'clsx'

export function cn(...inputs: Array<ClassValue>) {
  return twMerge(clsx(inputs))
}

type PeerListener<Event> = {
  on: (event: Event, listener: (...args: Array<any>) => void) => void
  off: (event: Event, listener: (...args: Array<any>) => void) => void
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
  return [user1Id, user2Id].sort().join('-')
}

export function sleep(ms: number) {
  return new Promise<void>((res) => setTimeout(() => res(), ms))
}

export function pgTimestamp(date: Date): string {
  return date.toISOString().replace('T', ' ').replace('Z', '').slice(0, 19)
}

export function safeParse<T = {}>(value: string) {
  try {
    const json = JSON.parse(value)

    if (!json) {
      return [null, false] as [data: null, ok: false]
    }

    return [json, true] as [data: T, ok: true]
  } catch {
    return [null, false] as [data: null, ok: false]
  }
}

export async function stubStream() {
  const video = document.createElement('video')
  video.muted = true // mute to allow autoplay without user interaction
  video.playsInline = true
  video.style.display = 'none'
  video.src = '/vod1.mp4'
  video.load()

  try {
    await new Promise((res) => {
      video.onloadedmetadata = () => res(0)
    })
    console.log('onloadedmetadata ')
    await video.play()
    console.log('play ')
    let localStream: MediaStream | null = null

    // 1. Capture stream from the source video element
    if ('captureStream' in video && typeof video.captureStream === 'function') {
      localStream = video.captureStream()
    } else if (
      'mozCaptureStream' in video &&
      typeof video.mozCaptureStream === 'function'
    ) {
      localStream = video.mozCaptureStream() // Firefox
    } else {
      console.error('captureStream API not supported.')
    }

    return localStream
  } catch (err) {
    console.error(err)
    return null
  }
}

export const CreateLogger = function (name: string) {
  const colors = [
    '#1E90FF', // DodgerBlue
    '#32CD32', // LimeGreen
    '#FFD700', // Gold
    '#FF69B4', // HotPink
    '#9370DB', // MediumPurple
    '#00CED1', // DarkTurquoise
    '#FFA500', // Orange
  ]

  const temp_iota = CreateLogger.iota
  const color = colors[temp_iota]
  CreateLogger.iota = (temp_iota + 1) % colors.length

  return (message1: string, ...messages: Array<string>) => {
    const PREFIX = `[${name}]: `
    console.log(`%c ${color} %s %s`, PREFIX, message1)
    console.log(messages.map((x) => ' '.repeat(PREFIX.length) + x).join('\n'))
  }
}
CreateLogger.iota = 0

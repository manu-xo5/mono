import { createSignal } from 'solid-js'

export type TOther = {
  userId: string
  displayName: string
}

const [signal, setSignal] = createSignal<TOther | null>(null)

export const OtherUser = {
  signal,
  setSignal: setSignal,
}

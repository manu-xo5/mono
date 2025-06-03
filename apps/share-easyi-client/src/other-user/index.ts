import { createSignal } from 'solid-js'
import type TPeer from 'simple-peer'

export type TOther = {
  userId: string
  displayName: string
  lastSignalData: TPeer.SignalData
}

const [signal, setSignal] = createSignal<TOther | null>(null)

export const OtherUser = {
  signal,
  setSignal: setSignal,
}

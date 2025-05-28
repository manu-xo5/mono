import Peer from 'simple-peer'
import { createSignal } from 'solid-js'

type CallStore = {
  id: string
  status: 'idle' | 'on-call'
}

export const [callStore, setCallStore] = createSignal<CallStore>({
  id: '',
  status: 'idle',
})

type CallStatus =
  | 'idle'
  | 'loading'
  | 'rejected'
  | 'accepted'
  | 'peer-offline'
  | 'failed'

export const [callStatus, setCallStatus] = createSignal<CallStatus>('idle')

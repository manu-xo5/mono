import { createEffect, createSignal } from 'solid-js'

type CallStore = {
  id: string
  status: 'idle' | 'on-call'
}

export type CallStatus =
  | 'idle'
  | 'incoming'
  | 'loading'
  | 'rejected'
  | 'accepted'
  | 'peer-offline'
  | 'disconnecting'
  | 'failed'

export const [callStore, setCallStore] = createSignal<CallStore>({
  id: '',
  status: 'idle',
})

export const [callStatus, setCallStatus] = createSignal<CallStatus>('idle')

export const [callStream, setCallStream] = createSignal<MediaStream[]>([])

createEffect(() => console.log('status', callStore().status))
createEffect(() => console.log('streams', callStream()))

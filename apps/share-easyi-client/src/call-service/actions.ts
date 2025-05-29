import { ETimeoutSymbol, timeout } from '@/effection.utils'
import type { MakeCallRequest, MakeCallResponse } from '@/types'
import { untilMessageOf } from '@/web-socket/utils'
import { call, race, sleep, until } from 'effection'
import type Peer from 'simple-peer'
import { CallPeer } from './peer'
import { callStore, setCallStatus, setCallStore } from './store'
import { peerOnce } from './utils'
import { stubStream } from '@/utils'

type Args = {
  to: string
  from: string
  ws: WebSocket
}

export function endCall() {
  setCallStore({
    id: '',
    status: 'idle',
  })
  setCallStatus('idle')
}

// const _peers = {
//   call: null,
// } as { call: null | Peer.Instance } & Record<string, null | Peer.Instance>

// cancel on spam
export function* makeCall({ ws, to, from }: Args) {
  if (callStore().status == 'on-call') {
    throw Error('already on call')
  }

  const stream = yield* until(
    navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: 'browser',
      },
    }),
  )
  const peer = CallPeer.init(true, stream)
  // send a requets
  const signalData = yield* peerOnce<Peer.SignalData>(peer, 'signal')

  const localSignal = JSON.stringify({
    type: 'make-call-request',
    to: to,
    from: from,
    body: {
      peerSignal: signalData,
    },
  } as MakeCallRequest)

  ws.send(localSignal)

  setCallStore((prev) => ({
    ...prev,
    status: 'on-call',
  }))
  setCallStatus('loading')

  const waitResponse = untilMessageOf<MakeCallResponse>(
    ws,
    'make-call-response',
  )
  const response = yield* race([sleep(10000), waitResponse])

  if (!response) {
    setCallStatus('rejected')
    yield* sleep(2000)
    setCallStore((prev) => ({
      ...prev,
      status: 'idle',
    }))
    return
  }

  const waitConnect = peerOnce<void>(peer, 'connect')
  peer.signal(response.body.peerSignal)

  const connected = yield* race([timeout(10000), waitConnect])

  if (connected == ETimeoutSymbol) {
    setCallStatus('failed')
    yield* sleep(2000)
    setCallStore((prev) => ({
      ...prev,
      status: 'idle',
    }))
    return
  }

  setCallStatus('accepted')

  yield* peerOnce(peer, 'close')

  endCall()
}

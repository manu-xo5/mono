import type { MakeCallRequest, MakeCallResponse } from '@/types'
import { untilMessageOf } from '@/web-socket/utils'
import { call, race, run, sleep, suspend, until } from 'effection'
import type Peer from 'simple-peer'
import { callStore, setCallStatus, setCallStore } from './store'
import { peerOnce } from './utils'
import { ETimeoutSymbol, timeout } from '@/effection.utils'

type Args = {
  to: string
  from: string
  ws: WebSocket
  peer: Peer.Instance
}

// const _peers = {
//   call: null,
// } as { call: null | Peer.Instance } & Record<string, null | Peer.Instance>

// cancel on spam
export function* makeCall({ ws, to, from, peer }: Args) {
  if (callStore().status == 'on-call') {
    throw Error('already on call')
  }
  // send a requets
  const signalData = yield* peerOnce<Peer.SignalData>(peer, 'signal')

  ws.send(
    JSON.stringify({
      type: 'make-call-request',
      to: to,
      from: from,
      body: {
        peerSignal: signalData,
      },
    } as MakeCallRequest),
  )

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
  console.log('connected')

  yield* suspend()
}

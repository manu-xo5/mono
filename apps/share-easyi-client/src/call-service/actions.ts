import { ETimeoutSymbol, timeout } from '@/effection.utils'
import type { MakeCallRequest, MakeCallResponse } from '@/types'
import { untilMessageOf } from '@/web-socket/utils'
import { race, sleep, until, type Operation } from 'effection'
import type Peer from 'simple-peer'
import { CallPeer } from './peer'
import { callStore, setCallStatus, setCallStore } from './store'
import { peerOnce } from './utils'

type Args = {
  to: string
  from: string
  ws: WebSocket
}

const callActions = {} as {
  endCall(args: Args): void
  makeCall(arg: Args): Operation<void>
}

callActions.endCall = function ({ ws, to, from }) {
  // if receiving call
  if (CallPeer.get() == null) {
    const res: MakeCallResponse = {
      type: 'make-call-response',
      from: from,
      to: to,
      body: {
        response: 'rejected',
        peerSignal: null,
      },
    }

    ws.send(JSON.stringify(res))
  } else {
    const res: MakeCallResponse = {
      type: 'make-call-response',
      from: from,
      to: to,
      body: {
        response: 'end',
        peerSignal: null,
      },
    }

    ws.send(JSON.stringify(res))

    setCallStore({
      id: '',
      status: 'idle',
    })
    setCallStatus('idle')
  }

  CallPeer.end()
}

// const _peers = {
//   call: null,
// } as { call: null | Peer.Instance } & Record<string, null | Peer.Instance>

// cancel on spam
callActions.makeCall = function* ({ ws, to, from }) {
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

  CallPeer.init(true, stream)
  const peer = CallPeer.get()
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

  if (
    !response ||
    response.body.response == 'rejected' ||
    response.body.response === 'end'
  ) {
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

  callActions.endCall({ ws, to: to, from: from })
}

export { callActions }

import type { AuthSession } from '@/auth'
import type { MakeCallRequest, MakeCallResponse } from '@/types'
import { untilMessageOf } from '@/web-socket/utils'
import { race, sleep } from 'effection'
import { callStore, setCallStatus, setCallStore } from './store'
import { getPeerSignal } from './utils'

let expectCallFrom = ''

type Args<T> = {
  user: AuthSession['user']
  ws: WebSocket
  msg: T
}

function* handleCallFail() {
  console.error('call failed')
  setCallStore({
    status: 'idle',
    id: '',
  })
  setCallStatus('failed')

  yield* sleep(1000)

  setCallStatus('idle')
}

export function* handleCallRequest({ ws, msg, user }: Args<MakeCallRequest>) {
  console.log('call handler')
  if (callStore().status == 'on-call') {
    // busy
    console.warn('user already on call')
    return
  }

  expectCallFrom = msg.from
  setCallStore({
    status: 'on-call',
    id: '',
  })

  // make a peer for call
  const p = yield* getPeerSignal()
  console.log("hello2")

  p.peer.signal(msg.body.peerSignal)

  p.peer.on('connect', () => {
    console.log('CONNECT RECEIVER')
  })

  ws.send(
    JSON.stringify({
      type: 'make-call-response',
      from: user.id,
      to: msg.from,
      body: {
        response: 'accepted',
        peerSignal: p.signalData,
      },
    } as MakeCallResponse),
  )

  // wait for connection on peer
  const call = yield* race([
    sleep(2000),
    untilMessageOf<Record<string, string>>(ws, 'call'),
  ])
  void call
  void expectCallFrom

  yield* handleCallFail()

  // if (!call) {
  //   // webrtc timeout, call failed
  //   expectCallFrom = msg.from
  //   setCallStore({
  //     status: 'on-call',
  //     id: 'abcbac',
  //   })
  // }

  // call.onStream(() => {})
}

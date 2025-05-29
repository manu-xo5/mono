import type { AuthSession } from '@/auth'
import { ETimeoutSymbol, timeout } from '@/effection.utils'
import type { MakeCallRequest, MakeCallResponse } from '@/types'
import { race, sleep, until } from 'effection'
import { CallPeer } from './peer'
import { callStore, setCallStatus, setCallStore } from './store'
import { getSignalData, peerOnce } from './utils'
import { callActions } from './actions'

type Args<T> = {
  user: AuthSession['user']
  ws: WebSocket
  msg: T
}

function* processCall({ ws, msg, user }: Args<MakeCallRequest>) {
  setCallStore({
    status: 'on-call',
    id: '',
  })
  setCallStatus('incoming')

  CallPeer.init(false)
  const peer = CallPeer.get()

  peer.signal(msg.body.peerSignal)

  const signalData = yield* until(getSignalData(peer))

  ws.send(
    JSON.stringify({
      type: 'make-call-response',
      from: user.id,
      to: msg.from,
      body: {
        response: 'accepted',
        peerSignal: signalData,
      },
    } as MakeCallResponse),
  )

  const connected = yield* race([
    peerOnce<void>(peer, 'connect'),
    timeout(2000),
  ])
  if (connected === ETimeoutSymbol) {
    return
  }

  setCallStatus('accepted')
  console.log('connected')

  yield* race([peerOnce(peer, 'close'), peerOnce(peer, 'error')])
  console.log('ended')

  setCallStore({
    id: '',
    status: 'ending',
  })

  yield* sleep(2000)
  setCallStore({
    id: '',
    status: 'idle',
  })
}

export function* handleCallRequest({ ws, msg, user }: Args<MakeCallRequest>) {
  if (callStore().status == 'on-call') {
    callActions.endCall({ ws, to: msg.from, from: user.id })
    return
  }

  yield* processCall({ ws, msg, user })
}

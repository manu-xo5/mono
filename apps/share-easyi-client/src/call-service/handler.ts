import type { AuthSession } from '@/auth'
import { ETimeoutSymbol, timeout } from '@/effection.utils'
import type { MakeCallRequest, MakeCallResponse } from '@/types'
import { race, sleep, until } from 'effection'
import type Peer from 'simple-peer'
import { CallPeer } from './peer'
import { callStore, setCallStatus, setCallStore } from './store'
import { getSignalData, peerOnce } from './utils'
import { endCall } from './actions'

type Args<T> = {
  user: AuthSession['user']
  ws: WebSocket
  msg: T
}

function rejectCall({ ws, user, msg }: Args<MakeCallRequest>) {
  console.warn('user already on call')
  ws.send(
    JSON.stringify({
      type: 'make-call-response',
      from: user.id,
      to: msg.from,
      body: {
        peerSignal: null as unknown as Peer.SignalData,
        response: 'rejected',
      },
    } as MakeCallResponse),
  )
  endCall()
}

function* processCall({ ws, msg, user }: Args<MakeCallRequest>) {
  const peer = CallPeer.init()
  peer.on('stream', (stream) => {
    console.log('on stream', stream)
    const video = document.createElement('video')
    document.body.append(video)

    if (video) {
      video.srcObject = stream
      video.play()
    }
  })

  setCallStore({
    status: 'on-call',
    id: '',
  })
  setCallStatus('loading')

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
// let audio: null | HTMLAudioElement = new Audio()
// peer.on('stream', (stream) => {
//   console.log('on stream', stream)
//   if (audio) {
//     audio.srcObject = stream
//     audio.play()
//   }
// })
// peer.on('close', () => (audio = null))

export function* handleCallRequest({ ws, msg, user }: Args<MakeCallRequest>) {
  if (callStore().status == 'on-call') {
    rejectCall({ ws, msg, user })
    return
  }

  yield* processCall({ ws, msg, user })
}

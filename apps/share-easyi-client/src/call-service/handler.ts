import type { AuthSession } from '@/auth'
import type { MakeCallRequest, MakeCallResponse } from '@/types'
import { untilMessageOf } from '@/web-socket/utils'
import { race, sleep, suspend } from 'effection'
import { callStore, setCallStatus, setCallStore } from './store'
import { getPeerSignal, peerOnce } from './utils'

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
  const p = yield* getPeerSignal(false)
  let audio: null | HTMLAudioElement = new Audio()
  p.peer.on('stream', (stream) => {
    console.log('on stream', stream)
    if (audio) {
      audio.srcObject = stream
      audio.play()
    }
  })

  p.peer.on('data', (raw) => console.log(String(raw)))
  p.peer.on('close', () => (audio = null))

  p.peer.signal(msg.body.peerSignal)

  p.peer.on('signal', (data) => {
    ws.send(
      JSON.stringify({
        type: 'make-call-response',
        from: user.id,
        to: msg.from,
        body: {
          response: 'accepted',
          peerSignal: data,
        },
      } as MakeCallResponse),
    )
  })

  yield* peerOnce(p.peer, 'connect')
  console.log('connected')

  yield* suspend()
}

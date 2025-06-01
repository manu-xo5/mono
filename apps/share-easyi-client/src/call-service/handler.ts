import type { AuthSession } from '@/auth'
import { ETimeoutSymbol, timeout } from '@/effection.utils'
import type { MakeCallRequest, MakeCallResponse } from '@/types'
import { untilMessageOf } from '@/web-socket/utils'
import { race, suspend, until } from 'effection'
import type Peer from 'simple-peer'
import { CallPeer } from './peer'
import { callStore, setCallStatus, setCallStore } from './store'
import { getSignalData, peerOnce } from './utils'

export function* handleCallAccept({
  ws,
  me,
}: {
  ws: WebSocket
  me: AuthSession['user']
}) {
  CallPeer.init(false)
  const peer = CallPeer.get()

  const otherPeer = CallPeer.getOther()
  if (!otherPeer) {
    console.log('returning')
    return
  }

  // HANDLE OTHER_SIGNAL NULL WITH UI FEEDBACK
  {
    peer.signal(otherPeer.signalData)

    const CALL_RESPONSE = JSON.stringify({
      type: 'make-call-response',
      from: me.id,
      to: otherPeer.userId,
      body: {
        response: 'accepted',
        peerSignal: yield* until(getSignalData(peer)),
      },
    } as MakeCallResponse)

    ws.send(CALL_RESPONSE)

    const waitConnect = peerOnce<void>(peer, 'connect')
    const connected = yield* race([waitConnect, timeout(2000)])

    if (connected === ETimeoutSymbol) {
      return
    }
  }

  setCallStatus('accepted')
  console.log('connected')

  yield* race([peerOnce(peer, 'close'), peerOnce(peer, 'error')])
  console.log('ended')

  setCallStatus('idle')
  setCallStore({
    id: '',
    status: 'idle',
  })

  CallPeer.destory()
}

type _Args = {
  to: string
  from: string
  ws: WebSocket
}

export function* handleMakeCall({ ws, to, from }: _Args) {
  if (callStore().status == 'on-call') {
    throw Error('already on call')
  }

  setCallStore({
    id: '',
    status: 'on-call',
  })
  setCallStatus('loading')

  CallPeer.init(true)
  const peer = CallPeer.get()
  peer.on('signal', (data) => {
    console.log('localSignal', data)
  })

  CallPeer.setOther({
    userId: to,
    displayName: '<unknown>',
    signalData: null as unknown as Peer.SignalData,
  })

  function* processCall() {
    {
      // login
      const localSignal = JSON.stringify({
        type: 'make-call-request',
        to: to,
        from: from,
        body: {
          peerSignal: yield* until(getSignalData(peer)),
        },
      } as MakeCallRequest)

      ws.send(localSignal)
    }

    {
      const res = yield* untilMessageOf<MakeCallResponse>(
        ws,
        'make-call-response',
        10000,
      )

      if (
        !res ||
        res === ETimeoutSymbol ||
        res.body.response == 'rejected' ||
        res.body.response === 'end'
      ) {
        return
      }

      CallPeer.setOther({
        userId: to,
        displayName: '<unknown>',
        signalData: null as unknown as Peer.SignalData,
      })
      peer.signal(res.body.peerSignal)
      const connect = yield* peerOnce<void>(peer, 'connect', 10000)

      if (connect == ETimeoutSymbol) {
        return
      }
    }

    // Successfully Connected
    yield* suspend()
  }

  yield* race([
    peerOnce(peer, 'close'),
    peerOnce(peer, 'end'),
    peerOnce(peer, 'error'),

    processCall(),
  ])

  setCallStore({
    id: '',
    status: 'idle',
  })
  console.log('done')

  // end here
  // const stream = yield* until(stubStream())
  // console.log(stream)
  // if (stream == null) return
  //
  // peer.on('signal', (data) => {
  //   console.log('hello', data)
  // })
  //
  // peer.addStream(stream)
  //
  // setCallStatus('accepted')
  //
  // yield* race([peerOnce(peer, 'error'), peerOnce(peer, 'close')])
  //
  // setCallStore({
  //   id: '',
  //   status: 'idle',
  // })
  // setCallStatus('idle')
  //
  // CallPeer.destory()
  // console.log('call ended')
  // console.log('CallPeer.get() =>', CallPeer._get())
}

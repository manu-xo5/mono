import type { AuthSession } from '@/auth'
import { ETimeoutSymbol, timeout } from '@/effection.utils'
import type { MakeCallResponse } from '@/types'
import { race, until } from 'effection'
import { CallPeer } from './peer'
import { setCallStatus, setCallStore } from './store'
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

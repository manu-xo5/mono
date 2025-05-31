import type { MakeCallResponse } from '@/types'
import { CallPeer } from './peer'
import { setCallStatus, setCallStore } from './store'

type Args = {
  to: string
  from: string
  ws: WebSocket
}

const callActions = {} as {
  endCall(args: Args): void
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

  CallPeer.destory()
}

export { callActions }

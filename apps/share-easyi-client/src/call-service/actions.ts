import { untilMessageOf } from '@/web-socket/utils'
import { sleep, race, run } from 'effection'
import { callStore, setCallStatus, setCallStore } from './store'
import type { MakeCallRequest, MakeCallResponse } from '@/types'
import { getPeerSignal } from './utils'

// cancel on spam
export async function makeCall({
  ws,
  to,
  from,
}: {
  to: string
  from: string
  ws: WebSocket
}) {
  await run(function* () {
    if (callStore().status == 'on-call') {
      console.error('already on call')
      return
    }
    // send a requets
    const p = yield* getPeerSignal()

    ws.send(
      JSON.stringify({
        type: 'make-call-request',
        to: to,
        from: from,
        body: {
          peerSignal: p.signalData,
        },
      } as MakeCallRequest),
    )

    setCallStore((prev) => ({
      ...prev,
      status: 'on-call',
    }))
    setCallStatus('loading')

    const reply = yield* race([
      sleep(10000),
      untilMessageOf<MakeCallResponse>(ws, 'make-call-response'),
    ])
    console.log(reply)

    if (!reply) {
      return
    }

    p.peer.signal(reply.body.peerSignal)
    p.peer.on('connect', () => {
      console.log('connected')
    })
    setCallStore((prev) => ({
      ...prev,
      status: 'idle',
    }))
    return

    setCallStatus('rejected')
    yield* sleep(2000)
    setCallStore((prev) => ({
      ...prev,
      status: 'idle',
    }))

    // acknowledge or timeout
    // hand over to handleCall
  })
}

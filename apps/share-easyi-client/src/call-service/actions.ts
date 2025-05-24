import { race, run, type Operation } from 'effection'
import { callStore, setCallStatus, setCallStore } from './store'
import { sleep } from '@/effection.utils'
import { untilMessageOf } from '@/web-socket/utils'

type MakeCallRequest = {
  type: 'make-call-request'
  to: string
  from: string
}

type MakeCallResponse = {
  type: 'make-call-response'
  to: string
  from: string
}

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
    ws.send(
      JSON.stringify({
        type: 'make-call-request',
        to: to,
        from: from,
      } as MakeCallRequest),
    )

    setCallStore((prev) => ({
      ...prev,
      status: 'on-call',
    }))
    setCallStatus('loading')

    const reply = yield* race([
      sleep(1000),
      untilMessageOf<MakeCallResponse>(ws, 'make-call-response'),
    ])
    console.log(reply)

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

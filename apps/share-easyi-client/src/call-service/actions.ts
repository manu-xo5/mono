import { race, run, sleep, suspend, until } from 'effection'
import {
  callStore,
  callStream,
  setCallStatus,
  setCallStore,
  setCallStream,
} from './store'
import { getSignalData, peerOnce } from './utils'
import type { CallMessage, MakeCallRequest } from '@/types'
import type TPeer from 'simple-peer'
import { Auth } from '@/auth'
import { ETimeoutSymbol } from '@/effection.utils'
import { OtherUser } from '@/other-user'
import { Peer } from '@/service/peer'
import { Socket } from '@/service/web-socket'
import { untilMessageOf } from '@/web-socket/utils'
import { safeParse } from '@/utils'

function reset() {
  setCallStatus('idle')
  setCallStore({
    id: '',
    status: 'idle',
  })

  setCallStore({
    id: '',
    status: 'idle',
  })
  console.log('done')
}

export const callActions = {
  handleIncoming(msg: MakeCallRequest) {
    console.log('call incoming... from', msg.from)

    if (callStore().status == 'on-call') {
      throw Error('todo handle incoming call when ')
    }

    OtherUser.setSignal({
      lastSignalData: msg.body.peerSignal,
      userId: msg.from,
      displayName: '<unknown>',
    })

    setCallStore({
      id: '',
      status: 'on-call',
    })

    setCallStatus('incoming')
  },

  make({ to }: { to: string }) {
    run(function* () {
      const ws = Socket.get()
      const peer = Peer.create({ initiator: true })
      const meUser = Auth.getUser()

      if (callStore().status == 'on-call') {
        throw Error('already on call')
      }

      setCallStore({
        id: '',
        status: 'on-call',
      })
      setCallStatus('loading')
      OtherUser.setSignal({
        userId: to,
        displayName: '<unknown>',
        lastSignalData: null as unknown as TPeer.SignalData,
      })

      // Send signal
      ws.send(
        JSON.stringify({
          type: 'make-call-request',
          to: to,
          from: meUser.id,
          body: {
            peerSignal: yield* until(getSignalData(peer)),
          },
        } as MakeCallRequest),
      )

      // EXTRA
      peer.on('signal', async (data) => {
        console.log('localSignal', data)
        await new Promise((res) => setTimeout(res, 1000))
        const signalMsg: CallMessage = {
          type: 'call-message',
          to: to,
          from: meUser.id,
          body: {
            type: 'signal',
            peerSignal: data,
          },
        }

        ws.send(JSON.stringify(signalMsg))
      })

      function* processCall() {
        const res = yield* untilMessageOf<CallMessage>(
          ws,
          'call-message',
          10000,
        )
        // exit if rejected / timeout
        if (res === ETimeoutSymbol || res.body.response !== 'accepted') {
          // audio.play()
          console.log('timedout')
          return
        }
        const resBody = res.body as {
          response: string
          peerSignal: TPeer.SignalData
        }
        // change global state
        OtherUser.setSignal({
          userId: to,
          displayName: '<unknown>',
          lastSignalData: resBody.peerSignal,
        })

        // set remote description
        const connectedOp = peerOnce<void>(peer, 'connect', 2000)
        peer.signal(resBody.peerSignal)
        const connected = yield* connectedOp
        console.log('connect', connected)

        if (connected == ETimeoutSymbol) {
          return
        }

        // Successfully Connected
        setCallStatus('accepted')
        yield* suspend()
      }

      yield* race([
        peerOnce(peer, 'close'),
        peerOnce(peer, 'end'),
        peerOnce(peer, 'error'),

        processCall(),
      ])

      setCallStatus('disconnecting')
      yield* sleep(2000)
      reset()

      Peer.destory()
      console.log('done')
    })
  },

  accept() {
    const [peerExists] = Peer.get()
    if (peerExists) {
      // do nothing
      return
    }

    const meUser = Auth.getUser()
    const ws = Socket.get()
    const peer = Peer.create()
    const other = OtherUser.signal()

    peer.on('stream', (stream) => {
      setCallStream((prev) => prev.concat(stream))
    })
    peer.on('error', (e) => console.log('peer.on(error)', e))

    setCallStatus('loading')
    function* process() {
      if (!other) {
        return
      }

      // start signal to init signal data
      peer.signal(other.lastSignalData)
      const CALL_RESPONSE = JSON.stringify({
        type: 'call-message',
        from: meUser.id,
        to: other.userId,
        body: {
          response: 'accepted',
          peerSignal: yield* until(getSignalData(peer)),
        },
      } as CallMessage)

      // send local signaldata to remote
      ws.send(CALL_RESPONSE)

      const connected = yield* peerOnce<void>(peer, 'connect', 2000)
      console.log('connected', connected)

      if (connected === ETimeoutSymbol) {
        return
      }

      // Successfully Connected
      setCallStatus('accepted')

      ws.addEventListener('message', (ev) => {
        const [parsed, ok] = safeParse<any>(ev.data)
        if (!ok) return

        if (parsed.type !== 'call-message') return

        peer.signal(parsed.body.peerSignal)
      })

      yield* suspend()
    }

    run(function* () {
      yield* race([process(), peerOnce(peer, 'close'), peerOnce(peer, 'error')])

      setCallStatus('disconnecting')
      yield* sleep(2000)

      reset()
      Peer.destory()
    })
  },

  addStream(stream: MediaStream) {
    const [peer, ok] = Peer.get()
    if (!ok) return

    // const stream = await navigator.mediaDevices.getDisplayMedia({
    //   video: true,
    // })

    peer.addStream(stream)

    setCallStream((prev) => prev.concat(stream))
  },
}

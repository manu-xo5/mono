import { Auth } from '@/auth'
import { ETimeoutSymbol } from '@/effection.utils'
import { OtherUser } from '@/other-user'
import { Peer } from '@/service/peer'
import { Socket } from '@/service/web-socket'
import type { CallMessage, MakeCallRequest } from '@/types'
import { untilMessageOf } from '@/web-socket/utils'
import { race, run, sleep, suspend, until } from 'effection'
import type TPeer from 'simple-peer'
import { callStore, setCallStatus, setCallStore } from './store'
import { getSignalData, peerOnce } from './utils'

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
    console.log('call status', callStore().status)

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
      console.log('to')
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

      // Start listening for signal
      const signalOp = until(getSignalData(peer))

      // EXTRA
      peer.on('signal', (data) => {
        console.log('localSignal', data)
      })

      // Send signal
      ws.send(
        JSON.stringify({
          type: 'make-call-request',
          to: to,
          from: meUser.id,
          body: {
            peerSignal: yield* signalOp,
          },
        } as MakeCallRequest),
      )

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
      console.log('done')
    })
  },

  accept() {
    const [peerExists] = Peer.get()
    console.log({ peerExists })
    if (peerExists) {
      // do nothing
      return
    }

    const meUser = Auth.getUser()
    const ws = Socket.get()
    const peer = Peer.create()
    const other = OtherUser.signal()

    setCallStatus('loading')

    function* process() {
      if (!other) {
        return
      }
      console.log({ lastSignalData: other.lastSignalData })

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
      yield* suspend()
    }

    run(function* () {
      yield* race([process(), peerOnce(peer, 'close'), peerOnce(peer, 'error')])

      setCallStatus('disconnecting')
      yield* sleep(2000)

      reset()
      console.log('done')
    })
  },
}

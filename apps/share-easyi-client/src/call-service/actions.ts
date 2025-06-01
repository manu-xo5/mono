import { Auth } from '@/auth'
import { ETimeoutSymbol } from '@/effection.utils'
import { OtherUser } from '@/other-user'
import { Peer } from '@/service/peer'
import { Socket } from '@/service/web-socket'
import type { MakeCallRequest, MakeCallResponse } from '@/types'
import { untilMessageOf } from '@/web-socket/utils'
import { race, run, sleep, suspend, until } from 'effection'
import type TPeer from 'simple-peer'
import { callStore, setCallStatus, setCallStore } from './store'
import { getSignalData, peerOnce } from './utils'

function accept() {
  const peer = Peer.create()
  const other = OtherUser.signal()
  if (!other) {
    return
  }

  peer.signal(other.lastSignalData)
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
        const res = yield* untilMessageOf<MakeCallResponse>(
          ws,
          'make-call-response',
          10000,
        )

        // exit if rejected / timeout
        if (
          !res ||
          res === ETimeoutSymbol ||
          res.body.response == 'rejected' ||
          res.body.response === 'end'
        ) {
          // audio.play()
          return
        }

        // change global state
        OtherUser.setSignal({
          userId: to,
          displayName: '<unknown>',
          lastSignalData: res.body.peerSignal,
        })

        // set remote description
        peer.signal(res.body.peerSignal)
        const connect = yield* peerOnce<void>(peer, 'connect', 10000)

        if (connect == ETimeoutSymbol) {
          return
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

      setCallStatus('failed')
      yield* sleep(2000)
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
    })
  },

  accept,
}

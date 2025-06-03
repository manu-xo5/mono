import { Auth } from '@/auth'
import { ETimeoutSymbol } from '@/effection.utils'
import { OtherUser } from '@/other-user'
import { Peer } from '@/service/peer'
import { Socket } from '@/service/web-socket'
import type { CallMessage, MakeCallRequest } from '@/types'
import { safeParse } from '@/utils'
import { untilMessageOf } from '@/web-socket/utils'
import { race, run, sleep, suspend } from 'effection'
import type TPeer from 'simple-peer'
import { callStore, setCallStatus, setCallStore, setCallStream } from './store'
import { CallAcceptMsg, peerOnce, resetStores } from './helpers'

function createHandleRemoteSignal(peer: TPeer.Instance) {
  return (ev: MessageEvent) => {
    const [parsed, ok] = safeParse<any>(ev.data)
    if (!ok) return

    if (parsed.type !== 'call-message') return
    if (peer.destroyed) return

    peer.signal(parsed.body.peerSignal)
  }
}

export const callActions = {
  handleIncoming(msg: MakeCallRequest) {
    console.log('call incoming... from', msg.from)

    if (callStore().status == 'on-call') {
      throw Error('todo handle incoming call when ')
    }

    OtherUser.setSignal({
      lastSignalData: null as unknown as TPeer.SignalData,
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
      if (callStore().status == 'on-call') {
        throw Error('already on call')
      }

      const ws = Socket.get()
      const meUser = Auth.getUser()

      OtherUser.setSignal({
        userId: to,
        displayName: '<unknown>',
        lastSignalData: null as unknown as TPeer.SignalData,
      })

      function* getResponse() {
        setCallStore({
          id: '',
          status: 'on-call',
        })
        setCallStatus('loading')

        ws.send(
          JSON.stringify({
            type: 'make-call-request',
            to: to,
            from: meUser.id,
            body: {},
          } as MakeCallRequest),
        )

        const res = yield* untilMessageOf<CallMessage>(
          ws,
          'call-message',
          10000,
        )

        // exit if rejected / timeout
        if (res === ETimeoutSymbol) return false
        if (res.body.response !== 'accepted') return false

        return true
      }

      function* processCall(peer: TPeer.Instance) {
        ws.addEventListener('message', (ev) => {
          const [parsed, ok] = safeParse<any>(ev.data)
          if (!ok) return

          if (parsed.type !== 'call-message') return
          if (!parsed.body) return
          if (parsed.body.type !== 'signal') return

          peer.signal(parsed.body.peerSignal)
        })
        // EXTRA
        peer.on('signal', async (data) => {
          console.log('localSignal', data)
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

        // set remote description
        const connected = yield* peerOnce<void>(peer, 'connect', 4000)
        console.log('connect', connected)

        if (connected == ETimeoutSymbol) {
          return
        }

        // Successfully Connected
        setCallStatus('accepted')
        yield* suspend()
      }

      try {
        const accepted = yield* getResponse()
        if (!accepted) {
          setCallStatus('disconnecting')
          yield* sleep(2000)
          resetStores()
          return
        }

        const peer = Peer.create({ initiator: true })
        yield* race([
          processCall(peer),

          peerOnce(peer, 'close'),
          peerOnce(peer, 'end'),
          peerOnce(peer, 'error'),
        ])

        setCallStatus('disconnecting')
        yield* sleep(2000)
        resetStores()
      } finally {
        Peer.destory()
        console.log('done')
      }
    })
  },

  accept() {
    run(function* () {
      const [peerExists] = Peer.get()
      if (peerExists) return

      const meUser = Auth.getUser()
      const ws = Socket.get()
      const peer = Peer.create()
      const other = OtherUser.signal()
      console.log('accept')
      // call failed here
      if (!other) return

      peer.on('stream', (stream) => {
        setCallStream((prev) => prev.concat(stream))
      })
      peer.on('error', (e) => console.log('peer.on(error)', e))

      peer.on('signal', (data) => {
        console.log({ other })
        if (!other) return

        const CALL_RESPONSE = JSON.stringify({
          type: 'call-message',
          from: meUser.id,
          to: other.userId,
          body: {
            type: 'signal',
            peerSignal: data,
          },
        } as CallMessage)

        // send local signaldata to remote
        ws.send(CALL_RESPONSE)
      })

      const handleRemoteSignal = createHandleRemoteSignal(peer)
      ws.addEventListener('message', handleRemoteSignal)

      // send local signaldata to remote
      ws.send(JSON.stringify(CallAcceptMsg({ meUser, otherUser: other })))

      setCallStatus('loading')
      const connected = yield* peerOnce<void>(peer, 'connect', 4000)
      console.log('connected', connected)

      if (connected === ETimeoutSymbol) {
        return
      }

      // Successfully Connected
      setCallStatus('accepted')

      try {
        yield* race([peerOnce(peer, 'close'), peerOnce(peer, 'error')])

        setCallStatus('disconnecting')
        yield* sleep(2000)

        resetStores()
      } finally {
        ws.removeEventListener('message', handleRemoteSignal)
        Peer.destory()
      }
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

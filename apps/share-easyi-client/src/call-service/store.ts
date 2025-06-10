import { race, run, sleep, suspend } from 'effection'
import { createEffect, createSignal } from 'solid-js'
import { CallAcceptMsg, peerOnce, resetStores } from './helpers'
import type { CallMessage, MakeCallRequest } from '@/types'
import type TPeer from 'simple-peer'
import { Auth } from '@/auth'
import { ETimeoutSymbol } from '@/effection.utils'
import { OtherUser } from '@/other-user'
import { Peer } from '@/service/peer'
import { Socket } from '@/service/web-socket'
import { safeParse } from '@/utils'
import { untilMessageOf } from '@/web-socket/utils'

export type CallStatus =
  | 'idle'
  | 'incoming'
  | 'loading'
  | 'rejected'
  | 'accepted'
  | 'peer-offline'
  | 'disconnecting'
  | 'failed'

type CallStore = {
  id: string
  status: 'idle' | 'on-call'
  callStatus: CallStatus
  streams: Array<MediaStream>
}

export const [callStore, setCallStore] = createSignal<CallStore>({
  id: '',
  status: 'idle',
  callStatus: 'idle',
  streams: [],
})
createEffect(() => console.log('status', callStore()))

function createHandleRemoteSignal(peer: TPeer.Instance) {
  return (ev: MessageEvent) => {
    const [parsed, ok] = safeParse<any>(ev.data)
    if (!ok) return

    if (parsed.type !== 'call-message') return
    if (peer.destroyed) return

    peer.signal(parsed.body.peerSignal)
  }
}

function handleIncoming(msg: MakeCallRequest) {
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
    callStatus: 'incoming',
    streams: [],
  })
}

function make({ to }: { to: string }) {
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
        callStatus: 'loading',
        streams: [],
      })

      ws.send(
        JSON.stringify({
          type: 'make-call-request',
          to: to,
          from: meUser.id,
          body: {},
        } as MakeCallRequest),
      )

      const res = yield* untilMessageOf<CallMessage>(ws, 'call-message', 10000)

      // exit if rejected / timeout
      if (res === ETimeoutSymbol) {
        Peer.log(
          'call ended',
          'Timeout cause call-message.accepted not received within time',
          ' returning...',
        )
        return false
      }
      if (res.body.response !== 'accepted') {
        Peer.log(
          'call ended',
          'call-message\'res.body.response != "accepted".',
          'returning...',
        )
        return false
      }
      return true
    }

    function* processCall(peer: TPeer.Instance) {
      Socket.log('[WS]: Listening for message.\n returning...')

      ws.addEventListener('message', (ev) => {
        Socket.log('Event = "Signal:Received"')
        const [parsed, ok] = safeParse<any>(ev.data)
        if (!ok) return

        if (parsed.type !== 'call-message') return
        if (!parsed.body) return
        if (parsed.body.type !== 'signal') return

        peer.signal(parsed.body.peerSignal)
      })

      // EXTRA
      Peer.log('Listening for local signal')
      peer.on('signal', async (data) => {
        const signalMsg: CallMessage = {
          type: 'call-message',
          to: to,
          from: meUser.id,
          body: {
            type: 'signal',
            peerSignal: data,
          },
        }

        Socket.log('Sending Event = Signal')
        ws.send(JSON.stringify(signalMsg))
      })

      // set remote description
      console.log('waiting for Event = "Connect"')
      const connected = yield* peerOnce<void>(peer, 'connect', 4000)

      if (connected == ETimeoutSymbol) {
        Peer.log('Not Connected', 'Timeout cause peer didnt emit connect event')
        return
      }

      Peer.log('OK CONNECTED')
      // Successfully Connected
      setCallStore((prev) => ({
        ...prev,
        callStatus: 'accepted',
      }))
      yield* suspend()
    }

    try {
      const accepted = yield* getResponse()

      if (!accepted) {
        setCallStore((prev) => ({
          ...prev,
          callStatus: 'disconnecting',
        }))
        yield* sleep(2000)
        resetStores()
        Peer.log('fail call rejected', 'yield* getResponse() = true')
        return
      }
      Peer.log('call accepted', 'yield* getResponse() = true')

      const peer = Peer.create({ initiator: true })
      yield* race([
        processCall(peer),

        peerOnce(peer, 'close'),
        peerOnce(peer, 'end'),
        peerOnce(peer, 'error'),
      ])
      console.log('make() race concluded')

      setCallStore((prev) => ({
        ...prev,
        callStatus: 'disconnecting',
      }))
      yield* sleep(2000)
      resetStores()
      console.log('make() finished')
    } finally {
      Peer.destory()
      console.log('make() cleanup')
    }
  })
}

function accept() {
  run(function* () {
    const [peerExists] = Peer.get()
    if (peerExists) {
      console.log("[Call]: wrong call to CallApi's accept() cause peerExists")
      return
    }

    const meUser = Auth.getUser()
    const ws = Socket.get()
    const peer = Peer.create()
    const other = OtherUser.signal()
    console.log('accept')
    // call failed here
    if (!other) {
      console.log(
        "[Call] fail): wrong call to CallApi's accept() cause other doesn't exisits",
      )
      return
    }

    peer.on('stream', (stream) => {
      console.log('[Call] info): got remote stream')
      setCallStore((prev) => ({
        ...prev,
        streams: prev.streams.concat(stream),
      }))
    })
    peer.on('error', (e) => console.log('peer.on(error)', e))

    peer.on('signal', (data) => {
      if (!other) {
        console.log(
          "[Call] info): ignoring local signal, cause other doesn't exisits cann't send to any one",
        )
        return
      }

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
      Socket.log(
        "ignoring local signal, cause other doesn't exisits cann't send to any one",
      )
      ws.send(CALL_RESPONSE)
    })

    const handleRemoteSignal = createHandleRemoteSignal(peer)
    ws.addEventListener('message', handleRemoteSignal)

    // send local signaldata to remote
    ws.send(JSON.stringify(CallAcceptMsg({ meUser, otherUser: other })))

    setCallStore((prev) => ({
      ...prev,
      callStatus: 'loading',
    }))
    const connected = yield* peerOnce<void>(peer, 'connect', 4000)
    console.log('connected', connected)

    if (connected === ETimeoutSymbol) {
      return
    }

    // Successfully Connected
    setCallStore((prev) => ({
      ...prev,
      callStatus: 'accepted',
    }))

    try {
      yield* race([peerOnce(peer, 'close'), peerOnce(peer, 'error')])
      console.log("accept's race concluded")

      setCallStore((prev) => ({
        ...prev,
        callStatus: 'disconnecting',
      }))
      yield* sleep(2000)

      resetStores()
      console.log('[Call]: accept finished')
    } finally {
      console.log('[Call]: accept cleanedup')
      ws.removeEventListener('message', handleRemoteSignal)
      Peer.destory()
    }
  })
}

function addStream(stream: MediaStream) {
  const [peer, ok] = Peer.get()
  if (!ok) return

  // const stream = await navigator.mediaDevices.getDisplayMedia({
  //   video: true,
  // })

  peer.addStream(stream)

  setCallStore((prev) => ({
    ...prev,
    streams: prev.streams.concat(stream),
  }))
}

export const actions = {
  handleIncoming,
  make,
  accept,
  addStream,
}

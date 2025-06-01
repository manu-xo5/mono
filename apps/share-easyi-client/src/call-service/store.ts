import type { AuthSession } from '@/auth'
import type Peer from 'simple-peer'
import type {
  CallMessage,
  Event,
  MakeCallRequest,
  MakeCallResponse,
} from '@/types'
import {
  createEffect,
  createSignal,
  type Accessor,
  type Setter,
} from 'solid-js'
import { safeParse } from '@/utils'
import {
  CallEvent,
  type CallDispatch,
  type CallDispatchEnd,
  type CallDispatchMake as CallDispatchAccept,
} from './consts'
import { timeout, ETimeoutSymbol } from '@/effection.utils'
import { until, race, run } from 'effection'
import { CallPeer } from './peer'
import { getSignalData, peerOnce } from './utils'

type CallStore = {
  id: string
  status: 'idle' | 'on-call' | 'ending'
}

export const [callStore, setCallStore] = createSignal<CallStore>({
  id: '',
  status: 'idle',
})

createEffect(() => console.log('status', callStore().status))

export type CallStatus =
  | 'idle'
  | 'incoming'
  | 'loading'
  | 'rejected'
  | 'accepted'
  | 'peer-offline'
  | 'failed'

export const [callStatus, setCallStatus] = createSignal<CallStatus>('idle')

type OtherPeer = {
  userId: string
  displayName: string
  initialSignalData: Peer.SignalData
}

export class CallApi {
  private static instance: CallApi | null = null
  private ws: WebSocket
  private meUser: AuthSession['user']

  private setStatus: Setter<CallStatus>
  private setStore: Setter<CallStore>
  private setOtherPeer: Setter<OtherPeer | null>
  status: Accessor<CallStatus>
  store: Accessor<CallStore>
  otherPeer: Accessor<OtherPeer | null>

  private constructor({
    ws,
    meUser,
  }: {
    ws: WebSocket
    meUser: AuthSession['user']
  }) {
    ;[this.otherPeer, this.setOtherPeer] = createSignal<OtherPeer | null>(null)
    ;[this.status, this.setStatus] = createSignal<CallStatus>('idle')
    ;[this.store, this.setStore] = createSignal<CallStore>({
      id: '',
      status: 'idle',
    })

    this.ws = ws
    this.meUser = meUser

    this.ws.addEventListener('message', (msg) => {
      const [data, ok] = safeParse(msg.data)
      if (!ok) return
      const parsedMessage = data as Event
      if (parsedMessage.type === 'call-message') {
        this.dispatch(parsedMessage.body as Event)
      } else {
        this.dispatch(parsedMessage)
      }
    })
  }

  static init({ ws, meUser }: { ws: WebSocket; meUser: AuthSession['user'] }) {
    if (CallApi.instance) return
    CallApi.instance = new CallApi({ ws, meUser })
  }

  static getInstance() {
    if (!CallApi.instance) {
      throw new Error('CallApi is not initialized')
    }
    return CallApi.instance
  }

  dispatch(action: CallDispatch) {
    switch (action.type) {
      case 'make-call-request':
        this.handleIncoming(action)
        break

      case CallEvent.Accept:
        const accept = this.accept.bind(this)
        run(function* () {
          yield* accept()
        })
        break

      case CallEvent.Reject:
        this.rejectCall(action)
        break

      case CallEvent.End:
        this.endCall()
        break
      default:
        console.warn('unknown action type error', action.type)
    }
  }

  *accept() {
    CallPeer.init(false)
    const peer = CallPeer.get()

    const otherPeer = this.otherPeer()
    if (!otherPeer) {
      console.log('returning')
      return
    }

    // HANDLE OTHER_SIGNAL NULL WITH UI FEEDBACK
    {
      peer.signal(otherPeer.initialSignalData)

      const CALL_RESPONSE: MakeCallResponse = {
        type: 'make-call-response',
        from: this.meUser.id,
        to: otherPeer.userId,
        body: {
          response: 'accepted',
          peerSignal: yield* until(getSignalData(peer)),
        },
      }

      this.ws.send(JSON.stringify(CALL_RESPONSE))

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
  }

  handleIncoming(msg: MakeCallRequest) {
    console.log('call incoming... from', msg.from)
    console.log('call status', this.store().status)

    if (this.store().status == 'on-call') {
      this.dispatch({
        type: CallEvent.Reject,
        payload: {
          otherUserId: msg.from,
        },
      })
      return
    }

    this.setOtherPeer({
      initialSignalData: msg.body.peerSignal,
      userId: msg.from,
      displayName: '<unknown>',
    })

    this.setStore({
      id: '',
      status: 'on-call',
    })

    this.setStatus('incoming')
  }

  rejectCall({ payload }: CallDispatchEnd) {
    console.log('rejecting cause already on call')

    const res: CallMessage = {
      type: 'call-message',
      from: this.meUser.id,
      to: payload.otherUserId,
      body: {
        type: 'end',
      },
    }

    this.ws.send(JSON.stringify(res))
  }

  endCall() {
    const otherUser = this.otherPeer()
    console.log('other peer', this.otherPeer())

    if (otherUser) {
      this.dispatch({
        type: CallEvent.Reject,
        payload: { otherUserId: otherUser.userId },
      })
    }

    this.setStore({
      id: '',
      status: 'idle',
    })
    this.setStatus('idle')
    this.setOtherPeer(null)

    throw Error('do peer.destory()')
  }
}

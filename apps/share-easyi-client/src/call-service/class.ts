import type { AuthSession } from '@/auth'
import { ETimeoutSymbol, peerOnce, wsMsgOnce } from '@/effection.utils'
import { Observable } from '@/lib/observable'
import type { TOther } from '@/other-user'
import { safeParse } from '@/utils'
import { race, run, sleep } from 'effection'
import Peer from 'simple-peer'
import {
  CallRequestDTO,
  CallResponseDTO,
  CallSignalDTO,
  type TCallResponse,
} from './dto'
import type { CallStatus } from './store'
import type TPeer from 'simple-peer'

export class CallApi {
  private ws: WebSocket
  private me: AuthSession['user']
  private peer: Peer.Instance | null = null
  private otherUser: TOther | null = null
  // events = createNanoEvents<TEvents>()

  status = new Observable<CallStatus>('idle')

  constructor(ws: WebSocket, me: AuthSession['user']) {
    this.ws = ws
    this.me = me

    this.ws.addEventListener('message', this.handleMessage)
  }

  private endCall() {
    if (this.peer) {
      this.peer.destroy()
      this.peer = null
    }
    this.otherUser = null
    this.status.notify('idle')
  }

  private handleMessage = (event: MessageEvent) => {
    const [data, ok] = safeParse<any>(event.data)

    if (!ok) {
      console.error('Failed to parse message:', event.data)
      return
    }

    switch (data.type) {
      case 'call-request': {
        if (this.status.getValue() !== 'idle') {
          throw new Error('todo handle multiple call responses')
        }

        this.status.notify('incoming')
        this.otherUser = {
          userId: data.from,
          displayName: data.payload.displayName,
        }
        break
      }

      case 'call-signal': {
        if (!this.peer) return

        if (data.from !== this.otherUser?.userId) return
        if (data.to !== this.me.id) return

        this.peer.signal(data.payload.signal)
        break
      }

      default:
        console.warn('Unknown message type:', data.type)
    }
  }

  private initPeer(opts: TPeer.Options) {
    if (this.peer) {
      this.peer.destroy()
    }
    this.peer = new Peer(opts)

    this.peer.on('signal', (signal) => {
      const otherUserId = this.otherUser?.userId
      if (!otherUserId) return

      const data = CallSignalDTO({
        from: this.me.id,
        to: otherUserId,
        signal,
      })

      this.ws.send(JSON.stringify(data))
    })
  }

  *requestCall(otherUserId: string) {
    if (this.status.getValue() !== 'idle') return false

    this.status.notify('loading')

    this.ws.send(
      JSON.stringify(CallRequestDTO({ from: this.me.id, to: otherUserId })),
    )

    const response = yield* wsMsgOnce<TCallResponse>(
      this.ws,
      'call-response',
      5000,
    )
    if (response === ETimeoutSymbol) {
      this.status.notify('rejected')
      yield* sleep(5000)
      this.status.notify('idle')
      return false
    }

    if (response.from !== otherUserId) {
      console.error('Call response from unexpected user:', response.from)
      this.status.notify('rejected')
      yield* sleep(5000)
      this.status.notify('idle')
      return false
    }

    return true
  }

  private *requestPeer({ initiator }: { initiator: boolean }) {
    this.status.notify('loading')

    this.initPeer({ initiator })
    if (!this.peer) return null

    const data = yield* peerOnce(this.peer, 'connect', 5000)
    if (data === ETimeoutSymbol) {
      this.status.notify('rejected')
      yield* sleep(5000)
      this.status.notify('idle')
      return null
    }

    this.status.notify('accepted')

    return this.peer
  }

  call(otherUserId: string) {
    const self = this
    return run(function* () {
      if (self.status.getValue() !== 'idle') return

      try {
        self.otherUser = { userId: otherUserId, displayName: '<unknown>' }

        const ok = yield* self.requestCall(otherUserId)
        if (!ok) return

        const peer = yield* self.requestPeer({ initiator: true })
        if (!peer) return

        yield* race([peerOnce(peer, 'error'), peerOnce(peer, 'close')])
      } finally {
        self.endCall()
      }
    })
  }

  async acceptCall() {
    if (!this.otherUser) return
    if (this.status.getValue() !== 'incoming') return

    const requestPeer = this.requestPeer.bind(this)

    try {
      this.ws.send(
        JSON.stringify(
          CallResponseDTO({
            from: this.me.id,
            to: this.otherUser.userId,
            response: 'accepted',
          }),
        ),
      )

      await run(function* () {
        const peer = yield* requestPeer({ initiator: false })
        if (!peer) return

        yield* race([peerOnce(peer, 'error'), peerOnce(peer, 'close')])
      })
    } finally {
      this.endCall()
    }
  }
}

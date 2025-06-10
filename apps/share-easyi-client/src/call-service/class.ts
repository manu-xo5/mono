import { race, run, sleep } from 'effection'
import Peer from 'simple-peer'
import { CallRequestDTO, CallResponseDTO, CallSignalDTO } from './dto'
import type { TCallResponse } from './dto'
import type { TOther } from '@/other-user'
import type { AuthSession } from '@/auth'
import type { CallStatus } from './store'
import type TPeer from 'simple-peer'
import { safeParse } from '@/utils'
import { Observable } from '@/lib/observable'
import { ETimeoutSymbol, peerOnce, wsMsgOnce } from '@/effection.utils'

const CALL_RESPONSE_TIMEOUT = 5000

export class CallApi {
  private ws: WebSocket
  private me: AuthSession['user']
  private peer: Peer.Instance | null = null
  private otherUser: TOther | null = null

  status = new Observable<CallStatus>('idle')

  constructor(ws: WebSocket, me: AuthSession['user']) {
    this.ws = ws
    this.me = me

    this.ws.addEventListener('message', this.handleMessage)
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
        setTimeout(() => {
          if (this.status.getValue() !== 'incoming') return

          this.endCall()
        }, CALL_RESPONSE_TIMEOUT)
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

  private *requestCall(otherUserId: string) {
    if (this.status.getValue() !== 'idle') return false

    this.status.notify('loading')

    this.ws.send(
      JSON.stringify(CallRequestDTO({ from: this.me.id, to: otherUserId })),
    )

    const response = yield* wsMsgOnce<TCallResponse>(
      this.ws,
      'call-response',
      CALL_RESPONSE_TIMEOUT,
    )
    if (response === ETimeoutSymbol) {
      yield* this.connectionTimeout()
      return false
    }

    if (response.from !== otherUserId) {
      console.error('Call response from unexpected user:', response.from)
      yield* this.connectionTimeout()
      return false
    }

    if (response.response === 'rejected') {
      yield* this.connectionTimeout()
      return false
    }

    return true
  }

  private *requestPeer({ initiator }: { initiator: boolean }) {
    this.status.notify('loading')

    this.initPeer({ initiator })
    if (!this.peer) return null

    const data = yield* peerOnce(this.peer, 'connect', CALL_RESPONSE_TIMEOUT)
    if (data === ETimeoutSymbol) {
      yield* this.connectionTimeout()
      return null
    }

    this.status.notify('accepted')

    return this.peer
  }

  private cleanupCall() {
    this.status.notify('idle')

    if (this.peer) {
      this.peer = null
    }
    this.otherUser = null
  }

  private *connectionTimeout() {
    this.status.notify('rejected')
    yield* sleep(2000)
    this.status.notify('idle')
  }

  endCall() {
    if (this.peer) {
      this.peer.destroy()
    } else {
      this.ws.send(
        JSON.stringify(
          CallResponseDTO({
            from: this.me.id,
            to: this.otherUser?.userId || '',
            response: 'rejected',
          }),
        ),
      )

      this.cleanupCall()
    }
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
        self.cleanupCall()
      }
    })
  }

  acceptCall() {
    const self = this
    run(function* () {
      if (!self.otherUser) return
      if (self.status.getValue() !== 'incoming') return

      try {
        self.ws.send(
          JSON.stringify(
            CallResponseDTO({
              from: self.me.id,
              to: self.otherUser.userId,
              response: 'accepted',
            }),
          ),
        )

        const peer = yield* self.requestPeer({ initiator: false })
        if (!peer) return

        yield* race([peerOnce(peer, 'error'), peerOnce(peer, 'close')])
      } finally {
        self.cleanupCall()
      }
    })
  }
}

import Peer from 'simple-peer'
import { createSignal } from 'solid-js'

interface IOtherPeer {
  signalData: Peer.SignalData
  userId: string
  displayName: string
}

interface ICallPeer {
  get(): Peer.Instance
  init(initiator?: boolean, stream?: MediaStream): boolean
  destory(): void
  _get(): Peer.Instance | null
  getOther: () => IOtherPeer | null
  setOther: (other: IOtherPeer | null) => void
}

export const [callStream, setCallStream] = createSignal<MediaStreamTrack[]>([])
let peer: Peer.Instance | null = null
let otherPeer: IOtherPeer | null

const CallPeer = {} as ICallPeer
CallPeer._get = function () {
  console.error('Remove CallPeer._get() before production')
  return peer
}

CallPeer.init = function (initiator = false, stream) {
  const p = new Peer({
    initiator,
    trickle: false,
    stream: stream ?? undefined,
    // config: {
    //   iceServers: [
    //     { urls: 'stun:freestun.net:3478' },
    //     {
    //       urls: 'turn:freestun.net:3478',
    //       username: 'free',
    //       credential: 'free',
    //     },
    //   ],
    // },
  })

  setCallStream([])
  p.on('track', (track) => {
    console.log('track')
    track.addEventListener('ended', () =>
      setCallStream((prev) => prev.filter((t) => t != track)),
    )
    setCallStream((prev) => prev.concat(track))
  })

  if (peer) {
    peer.end()
    peer.destroy()
  }

  peer = p
  return true
}

CallPeer.get = function () {
  if (peer == null) {
    throw Error("getUserSession can't be used before the router")
  }

  return peer
}

CallPeer.destory = function () {
  if (!peer) return

  peer.destroy()
  peer = null
}

CallPeer.getOther = function () {
  return otherPeer
}
CallPeer.setOther = function (other) {
  otherPeer = other
}

export { CallPeer }

import type TPeer from 'simple-peer'
import SimplePeer from 'simple-peer'

let peer: TPeer.Instance | undefined

export const Peer = {
  create(opts?: TPeer.Options | undefined) {
    if (peer) {
      peer.destroy()
      peer = undefined
    }

    peer = new SimplePeer(opts)
    return peer
  },
  get() {
    if (!peer) {
      throw new Error("Peer.get() used before create one or Peer was destroyed")
    }

    return Peer.create()
  },
  destory() {
    peer?.destroy()
    peer = undefined
  },
}

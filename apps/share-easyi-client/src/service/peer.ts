import type TPeer from 'simple-peer'
import SimplePeer from 'simple-peer'

let peer: TPeer.Instance | undefined

export const Peer = {
  create(opts?: TPeer.Options | undefined) {
    if (peer) {
      peer.destroy()
      peer = undefined
    }

    peer = new SimplePeer({
      trickle: false,
      ...opts,
    })
    return peer
  },

  get(): [typeof peer, boolean] {
    return [peer, !!peer]
  },

  destory() {
    peer?.destroy()
    peer = undefined
  },
}

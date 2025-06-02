import SimplePeer from 'simple-peer'
import type TPeer from 'simple-peer'

let peer: TPeer.Instance | undefined

export const Peer = {
  create(opts?: TPeer.Options | undefined) {
    if (peer) {
      peer.destroy()
      peer = undefined
    }

    peer = new SimplePeer({
      ...opts,
    })
    return peer
  },

  get(): [TPeer.Instance, true] | [undefined, false] {
    if (peer) {
      return [peer, true]
    }

    return [undefined, false]
  },

  destory() {
    peer?.destroy()
    peer = undefined
  },
}

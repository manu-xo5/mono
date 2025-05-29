import Peer from 'simple-peer'

let peer: Peer.Instance | null = null

function get() {
  if (peer == null) {
    throw Error("CallPeer.get() can't be used before the CallPeer.init()")
  }

  return peer
}

function init(initiator: boolean = false, stream?: MediaStream | null) {
  if (peer) return peer

  console.log(stream)
  const p = new Peer({
    initiator,
    trickle: false,
    stream: stream ?? undefined,
  })

  peer = p
  return p
}

function end() {
  if (!peer) return

  peer.destroy()
  peer = null
}

export const CallPeer = {
  get,
  init,
  end,
}

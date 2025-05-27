import { action } from 'effection'
import Peer from 'simple-peer'

export const getPeerSignal = () => {
  return action<{
    peer: Peer.Instance
    signalData: Peer.SignalData
  }>((res) => {
    const peer = new Peer({
      initiator: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ],
      },
    })
    const handler = (signalData: Peer.SignalData) => {
      res({
        peer,
        signalData,
      })

      peer.off('signal', handler)
    }

    peer.on('signal', handler)
    return () => {
      peer.off('signal', handler)
      peer.end()
    }
  })
}

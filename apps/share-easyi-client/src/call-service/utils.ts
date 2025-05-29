import { action, type Operation } from 'effection'
import Peer from 'simple-peer'

type Res<T> = T extends false
  ? { peer: Peer.Instance; signalData: null }
  : { peer: Peer.Instance; signalData: Peer.SignalData }

export const getPeerSignal = <T extends boolean>(initiator: T) => {
  return action<Res<T>>((res) => {
    const peer = new Peer({ initiator, trickle: false })

    if (!initiator) {
      res({
        peer,
        signalData: null,
      } as Res<T>)

      return () => {}
    }

    const handler = (signalData: Peer.SignalData) => {
      console.log({ signalData })
      res({
        peer,
        signalData,
      } as Res<T>)

      peer.off('signal', handler)
    }

    peer.on('signal', handler)
    return () => peer.off('signal', handler)
  })
}

export const peerOnce = <T>(
  peer: Peer.Instance,
  eventName: string,
): Operation<T> => {
  return action<T>((res) => {
    const handler = (tar: T) => {
      res(tar)
    }

    peer.on(eventName, handler)
    return () => peer.off(eventName, handler)
  })
}

export async function getSignalData(peer: Peer.Instance) {
  const { promise, resolve } = Promise.withResolvers<Peer.SignalData>()

  peer.on('signal', (data) => {
    resolve(data)
  })

  return await promise
}

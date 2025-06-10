import {  race, suspend, withResolvers } from 'effection'
import { setCallStore } from './store'
import type {Operation} from 'effection';
import type Peer from 'simple-peer'
import type { ETimeoutSymbol} from '@/effection.utils';
import type { TOther } from '@/other-user'
import type { AuthSession } from '@/auth'
import { timeout } from '@/effection.utils'

export function* peerOnce<T>(
  peer: Peer.Instance,
  eventName: string,
  timeoutMs?: number,
) {
  const { operation, resolve } = withResolvers<T>()
  const timeoutOp = timeoutMs
    ? timeout(timeoutMs)
    : (suspend() as Operation<typeof ETimeoutSymbol>)

  const handler = (tar: T) => {
    resolve(tar)
  }

  peer.on(eventName, handler)
  try {
    return yield* race([operation, timeoutOp])
  } finally {
    peer.off(eventName, handler)
  }
}

export function CallAcceptMsg({
  meUser,
  otherUser,
}: {
  meUser: AuthSession['user']
  otherUser: TOther
}) {
  return {
    type: 'call-message',
    from: meUser.id,
    to: otherUser.userId,
    body: {
      response: 'accepted',
    },
  }
}

export function resetStores() {
  setCallStore({
    id: '',
    status: 'idle',
    callStatus: 'idle',
    streams: [],
  })
  console.log('done')
}

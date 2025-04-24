import type { DataConnection } from 'peerjs'
import { sleep, TimeoutError } from '@/lib/utils.js'
import { useStore } from '@/store/index.js'
import { ResultAsync } from 'neverthrow'
import { CallAction } from './actions/incoming-call.js'

export function handleCallDataConn(conn: DataConnection) {
  const callSlice = useStore.getState().callSlice

  if (callSlice.status === 'incoming-call') {
    console.warn('incoming-call during existing call', callSlice.status)
    conn.once('open', () => {
      conn.send('rejected')
      conn.close()
    })
  }
  else {
    conn.once('open', () => {
      CallAction.receiveCall({ dataConn: conn })
    })
  }
}

export function getCallResponse(conn: DataConnection): ResultAsync<string, Error> {
  const promise = new Promise<'accepted' | 'rejected'>((res, rej) => {
    let isDone = false
    const handleData = (data: unknown) => {
      if (typeof data === 'string' && (data === 'accepted' || data === 'rejected')) {
        if (isDone) {
          return
        }
        isDone = true
        conn.off('data', handleData)
        res(data)
      }
    }

    sleep(5000).then(() => {
      if (isDone) {
        return
      }
      isDone = true
      conn.off('data', handleData)
      rej(new Error('Call Timeout'))
    })

    conn.on('data', handleData)
  })

  return ResultAsync.fromPromise(promise, () => new TimeoutError('Call Timeout'))
}

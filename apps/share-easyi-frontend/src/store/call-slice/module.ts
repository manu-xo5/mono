import type { DataConnection } from 'peerjs'
import { useStore } from '@/store/index.js'
import { CallAction } from './actions.js'

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

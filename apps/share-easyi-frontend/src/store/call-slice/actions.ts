import type { DataConnection } from 'peerjs'
import type { CallSlice } from './index.js'
import { CALL_RESPONSE_TIME } from '@/constants.js'
import { useStore } from '@/store/index.js'

const getCallSlice = () => useStore.getState().callSlice
const setCallSlice = (newState: Partial<CallSlice>) => useStore.setState(state => ({ callSlice: Object.assign({}, state.callSlice, newState) }))

function receiveCall({ dataConn }: { dataConn: DataConnection }): void {
  const timeout = window.setTimeout(() => {
    missedCall({
      dataConn,
    })
  }, CALL_RESPONSE_TIME)

  setCallSlice({
    status: 'incoming-call',
    dataConn,
    timeout,
  })
}

function acceptCall() {
  const { timeout, dataConn } = getCallSlice()

  clearTimeout(timeout)
  dataConn?.send('accepted')

  setCallSlice({
    status: 'on-call',
    timeout: 0,
  })
}

function rejectCall() {
  const { timeout, dataConn } = getCallSlice()
  clearTimeout(timeout)
  dataConn?.send('rejected')
  dataConn?.close()

  setCallSlice({
    status: 'standby',
    timeout: 0,
  })
}

function missedCall({ dataConn }: { dataConn: DataConnection }) {
  if (dataConn !== getCallSlice().dataConn) {
    console.error(new Error('dispatchUserStore: received MISSED_CALL action for conn that differ from state.dataConn'))
  }
  dataConn.close()

  setCallSlice({
    dataConn: null,
    status: 'standby',
  })
}

function requestFailed() {
  setCallSlice({ status: 'call-request-failed' })
}

function makeRequest({ otherPeerId }: { otherPeerId: string }) {
  const { peer } = useStore.getState()

  if (peer == null) {
    console.error(makeRequest.name, ': peer is null')
    requestFailed()
    return
  }

  const conn = peer.connect(otherPeerId, { metadata: { type: 'call' } })
  setCallSlice({ status: 'outgoing-call' })

  const connectionTimeout = setTimeout(() => {
    console.error(makeRequest.name, ':(timeout) peer.connect failed to open within reasonable time')
    requestFailed()
    conn.off('open', handleOpen)
    conn.close()
  }, 1000)

  function handleOpen() {
    clearTimeout(connectionTimeout)

    const responseTimeout = window.setTimeout(() => {
      setCallSlice({ status: 'call-request-rejected' })
      conn.close()
    }, CALL_RESPONSE_TIME)

    function handleData(data: unknown) {
      if (data === 'accepted') {
        clearTimeout(responseTimeout)
        setCallSlice({ status: 'on-call' })
        return
      }

      if (data === 'rejected') {
        clearTimeout(responseTimeout)
        setCallSlice({ status: 'call-request-rejected' })
      }
    }
    conn.on('data', handleData)
  }
  conn.once('open', handleOpen)
}

export const CallAction = {
  receiveCall,
  acceptCall,
  rejectCall,
  missedCall,
  makeRequest,
  requestFailed,
}

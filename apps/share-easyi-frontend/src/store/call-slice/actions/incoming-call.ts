import type { DataConnection } from 'peerjs'
import type { CallSlice } from '@/store/call-slice/index.js'
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

export const CallAction = {
  receiveCall,
  acceptCall,
  rejectCall,
  missedCall,
}

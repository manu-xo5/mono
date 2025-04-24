import type { CallSlice } from '@/store/call-slice/index.js'
import { createDataConn } from '@/lib/peerjs/index.js'
import { useStore } from '@/store/index.js'
import { tryCatch } from '@workspace/utils/try-catch'
import { getCallResponse } from '../module.js'

// eslint-disable-next-line unused-imports/no-unused-vars
const getCallSlice = () => useStore.getState().callSlice
const setCallSlice = (newState: Partial<CallSlice>) => useStore.setState(state => ({ callSlice: Object.assign({}, state.callSlice, newState) }))

function requestFailed() {
  setCallSlice({ status: 'call-request-failed' })
}

async function makeRequest({ otherPeerId }: { otherPeerId: string }) {
  const { peer } = useStore.getState()

  if (peer == null) {
    console.error(makeRequest.name, ': peer is null')
    requestFailed()
    return
  }

  setCallSlice({ status: 'outgoing-call' })

  const [timeoutError, conn] = await tryCatch(createDataConn(peer, otherPeerId, { metadata: { type: 'call' } }))

  if (timeoutError) {
    requestFailed()
    return
  }

  const response = await getCallResponse(conn)

  // no answer within specified time
  if (response.isErr() || response.value === 'rejected') {
    setCallSlice({ status: 'call-request-rejected' })
    conn.close()
    return
  }

  if (response.value === 'accepted') {
    setCallSlice({ status: 'on-call', dataConn: conn })
  }
}

export const OutgoingCallAction = {
  requestFailed,
  makeRequest,
}

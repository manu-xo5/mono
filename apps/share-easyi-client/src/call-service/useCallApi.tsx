import { createContext, type JSX, useContext } from 'solid-js'
import { CallApi } from './class'
import { createSignal } from 'solid-js'

const context = createContext<CallApi | undefined>()

export function CallApiProvider(props: {
  callApi: CallApi
  children: JSX.Element
}) {
  return (
    <context.Provider value={props.callApi}>{props.children}</context.Provider>
  )
}

export function useCallApi() {
  const callApi = useContext(context)

  if (!callApi) {
    throw new Error('useCallApi must be used within CallApiProvider')
  }

  const [callStatus, setCallStatus] = createSignal(callApi.status.getValue())

  callApi.status.subscribe((status) => {
    setCallStatus(status)
  })

  return {
    callStatus,
    call: callApi.call.bind(callApi),
  }
}

import {
  Match,
  Show,
  Switch,
  createContext,
  createSignal,
  useContext,
} from 'solid-js'
import { UnknownMicErrorDialog } from './presentation/unknown-mic-error-dialog'
import type { JSX } from 'solid-js'
import type { CallApi, TCallApiError } from './class'

const context = createContext<CallApi | undefined>()

export function CallApiProvider(props: {
  callApi: CallApi
  children: JSX.Element
}) {
  const [error, setError] = createSignal<TCallApiError>('')

  props.callApi.errors.subscribe((e) => setError(e))

  return (
    <context.Provider value={props.callApi}>
      {props.children}

      <Switch>
        <Match when={error() !== ''}>
          <UnknownMicErrorDialog />
        </Match>
      </Switch>
    </context.Provider>
  )
}

export function useCallApi() {
  const callApi = useContext(context)
  if (!callApi) {
    throw new Error('useCallApi must be used within CallApiProvider')
  }

  const [callStatus, setCallStatus] = createSignal(callApi.status.getValue())
  const [callError, setCallError] = createSignal<TCallApiError>('')

  callApi.status.subscribe((status) => setCallStatus(status))

  callApi.errors.subscribe((error) => setCallError(error))

  return {
    callStatus,
    callError,
    call: callApi.call.bind(callApi),
    acceptCall: callApi.acceptCall.bind(callApi),
    endCall: callApi.endCall.bind(callApi),
    resetError: () => callApi.errors.notify(''),
  }
}

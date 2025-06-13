import { run } from 'effection'
import {
  Match,
  Switch,
  createContext,
  createSignal,
  useContext,
} from 'solid-js'
import { NoMicPermissionDialog } from './components/no-mic-permission-dialog'
import { UnknownMicErrorDialog } from './components/unknown-mic-error-dialog'
import { NoMicDeviceDialog } from './components/no-mic-device-dialog'
import type { CallApi, TCallApiError } from './class'
import type { JSX } from 'solid-js'

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
        <Match when={error() === 'no-mic-device'}>
          <NoMicDeviceDialog />
        </Match>

        <Match when={error() === 'permission-denied'}>
          <NoMicPermissionDialog />
        </Match>

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

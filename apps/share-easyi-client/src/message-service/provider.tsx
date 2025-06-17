import { createEffect, createSignal } from 'solid-js'
import { context } from './context'
import { fetchRooms } from './api'
import type { JSX } from 'solid-js'
import type { TConversationStore } from './types'
import { API_VX } from '@/api'

const initialState: TConversationStore = {
  convSyncStatus: 'idle',
  convs: {},
}

type TProps = {
  children: JSX.Element
}
export const ConversationProvider = (props: TProps) => {
  const [getState, setState] = createSignal(initialState)

  let hasUpdated = false
  createEffect(async () => {
    if (hasUpdated) return
    setState((prev) => ({
      ...prev,
      convStatus: 'loading',
    }))

    const allRooms = await fetchRooms(API_VX).catch(() => null)
    if (allRooms) {
      hasUpdated = true
    }

    setState((prev) => ({
      ...prev,
      convStatus: 'loading',
    }))
  })

  return (
    <context.Provider
      value={{
        getState,
        setState,
      }}
    >
      {props.children}
    </context.Provider>
  )
}

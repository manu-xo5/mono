import { createContext } from 'solid-js'
import type { Setter } from 'solid-js'
import type { TConversationStore } from './types'

export const context = createContext<
  | undefined
  | {
      getState: () => TConversationStore
      setState: Setter<TConversationStore>
    }
>(undefined)

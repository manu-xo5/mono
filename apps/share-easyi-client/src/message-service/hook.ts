import { useContext } from 'solid-js'
import { context } from './context'

export const useConversationManager = () => {
  const contextValue = useContext(context)
  if (!contextValue) {
    throw new Error(
      'useConversationManager must be used within a ConversationProvider',
    )
  }
  const { getState, setState } = contextValue
  void setState

  function getAllConvs() {
    const state = getState()
    return Object.keys(state.convs).filter(Boolean)
  }

  function getConv(roomId: string) {
    const state = getState()
    return state.convs[roomId] || null
  }

  return {
    getConv,
    getAllConvs,
  }
}

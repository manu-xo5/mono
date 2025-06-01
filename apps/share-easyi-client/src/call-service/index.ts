import { callActions } from './actions'
import { callWsMiddleware } from './middleware'
import { callStatus, callStore } from './store'

export const CallApi = {
  store: callStore,
  status: callStatus,
  actions: callActions,
  wsMiddleware: callWsMiddleware,
}

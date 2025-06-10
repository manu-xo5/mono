import { wsMiddleware } from './middleware'
import { actions, callStore } from './store'

export const CallApi = {
  store: callStore,
  actions,
  wsMiddleware,
}

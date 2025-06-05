import { wsMiddleware } from './middleware'
import { callStore, actions } from './store'

export const CallApi = {
  store: callStore,
  actions,
  wsMiddleware,
}

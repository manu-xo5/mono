import { createAuthClient } from 'better-auth/solid'
import { SERVER_BASE } from '@/constants'

export const authClient = createAuthClient({
  baseURL: SERVER_BASE,
})

export type AuthSession = (typeof authClient.$Infer)['Session']

let cacheUserSession: null | AuthSession = null
async function init() {
  if (cacheUserSession) {
    return true
  }

  const ok = await fetch(SERVER_BASE + '/api/ping', {
    credentials: 'include',
  })
    .then((r) => r.ok)
    .catch(() => false)

  if (!ok) {
    cacheUserSession = null
    return false
  }

  const session = await authClient.getSession()

  if (session.error || !session.data) {
    cacheUserSession = null
    return false
  }

  cacheUserSession = session.data
  return true
}

function getSession() {
  if (!cacheUserSession) {
    throw Error("getUserSession can't be used before the router")
  }

  return cacheUserSession
}

function get() {
  if (!cacheUserSession) {
    throw Error("getUser can't be used before the router")
  }

  return cacheUserSession.user
}

async function signOut() {
  cacheUserSession = null
  await authClient.signOut()
}

export const Auth = {
  init,
  getSession,
  get,
  signOut,
}

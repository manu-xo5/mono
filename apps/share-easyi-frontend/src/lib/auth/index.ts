import { createAuthClient } from 'better-auth/react'
import { redirect } from '@tanstack/react-router'
import { SERVER_BASE } from '@/constants'

export const authClient = createAuthClient({
  baseURL: 'http://localhost:1553',
})

type AuthSession = (typeof authClient.$Infer)['Session']

let cacheUser: null | AuthSession = null

export async function verifyUserSession() {
  if (cacheUser) {
    return cacheUser
  }

  const ok = await fetch(SERVER_BASE + '/api/ping')
    .then((r) => r.ok)
    .catch(() => false)

  if (!ok) {
    cacheUser = null
    throw redirect({
      to: '/server-down',
      mask: {
        to: '/home',
        unmaskOnReload: true,
      },
    })
  }

  const session = await authClient.getSession()
  if (session.error || !session.data) {
    cacheUser = null
    throw redirect({ to: '/login' })
  }

  cacheUser = session.data
  return session.data
}

export async function signOutUser() {
  cacheUser = null
  await authClient.signOut()
}

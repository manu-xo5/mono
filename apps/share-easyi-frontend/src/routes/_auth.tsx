import { PageLoader } from '@/components/page-loader'
import { authClient } from '@/lib/auth'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

async function verifyUserSession() {
  const session = await authClient.getSession()
  if (session.error || !session.data) {
    throw redirect({ to: '/login' })
  }

  console.log(session.data)
  return session.data
}

export const Route = createFileRoute('/_auth')({
  component: Outlet,
  beforeLoad: verifyUserSession,
  pendingComponent: PageLoader,
})

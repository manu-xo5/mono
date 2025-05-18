import { PageLoader } from '@/components/page-loader'
import { verifyUserSession } from '@/lib/auth'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth')({
  component: Outlet,
  pendingMinMs: 1000,
  beforeLoad: verifyUserSession,
  pendingComponent: PageLoader,
})

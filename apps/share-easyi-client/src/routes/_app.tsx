import { PageLoader } from '@/components/page-loader'
import { verifyUserSession } from '@/auth'
import { createFileRoute, Outlet } from '@tanstack/solid-router'

export const Route = createFileRoute('/_app')({
  component: Outlet,
  pendingMinMs: 1000,
  beforeLoad: verifyUserSession,
  pendingComponent: PageLoader,
})

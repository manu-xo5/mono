import type { QueryClient } from '@tanstack/react-query'
import { OutgoingCall } from '@/components/CallHandlerDialog'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import Header from '@/components/Header'
import TanstackQueryLayout from '@/integrations/tanstack-query/layout'

type MyRouterContext = {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <Header />

      <div className="bg-background">
        <Outlet />

        <OutgoingCall />
      </div>
      <TanStackRouterDevtools />

      <TanstackQueryLayout />
    </>
  ),
})

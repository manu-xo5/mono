import { Outlet, createRootRoute } from '@tanstack/solid-router'
import { ServerDown } from '@/components/server-down'
import { TanstackQueryProvider } from '@/integrations/tanstack-query/provider'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <TanstackQueryProvider>
      <div class="bg-background">
        <Outlet />
        {/* <MessageStoreDevtools buttonPosition="up" />*/}
        {/* <TanStackRouterDevtools />*/}
        {/* <SolidQueryDevtools buttonPosition="bottom-right" />*/}
      </div>
    </TanstackQueryProvider>
  )
}

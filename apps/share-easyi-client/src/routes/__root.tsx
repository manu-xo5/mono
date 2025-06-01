import { ServerDown } from '@/components/server-down'
import { TanstackQueryProvider } from '@/integrations/tanstack-query/provider'
import { createRootRoute, Outlet } from '@tanstack/solid-router'

export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: ServerDown,
})

function RootComponent() {
  return (
    <TanstackQueryProvider>
      <div class="bg-background">
        <Outlet />
        {/*<MessageStoreDevtools buttonPosition="up" />*/}
        {/*<TanStackRouterDevtools />*/}
        {/*<SolidQueryDevtools buttonPosition="bottom-right" />*/}
      </div>
    </TanstackQueryProvider>
  )
}

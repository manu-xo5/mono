import { TanstackQueryProvider } from '@/integrations/tanstack-query/provider'
import { createRootRouteWithContext, Outlet } from '@tanstack/solid-router'

export const Route = createRootRouteWithContext<{}>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <TanstackQueryProvider>
        <div class="bg-background">
          <Outlet />
          {/*<MessageStoreDevtools buttonPosition="up" />*/}
          {/*<TanStackRouterDevtools />*/}
          {/*<SolidQueryDevtools buttonPosition="bottom-right" />*/}
        </div>
      </TanstackQueryProvider>
    </>
  )
}

import { createRootRouteWithContext, Outlet } from '@tanstack/solid-router'
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools'
import { TanstackQueryProvider } from '@/integrations/tanstack-query/provider'
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools'

export const Route = createRootRouteWithContext<{}>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <TanstackQueryProvider>
        <div class="bg-background">
          <Outlet />
        </div>

        <TanStackRouterDevtools />
        <SolidQueryDevtools buttonPosition="bottom-right" />
      </TanstackQueryProvider>
    </>
  )
}

import { createRootRouteWithContext, Outlet } from '@tanstack/solid-router'
import { TanStackRouterDevtools } from '@tanstack/solid-router-devtools'
import { TanstackQueryProvider } from '@/integrations/tanstack-query/provider'
import { SolidQueryDevtools } from '@tanstack/solid-query-devtools'
import { MessageStoreDevtools } from '@/message-service/devtools'

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

        <MessageStoreDevtools buttonPosition="up" />
        <TanStackRouterDevtools />
        <SolidQueryDevtools buttonPosition="bottom-right" />
      </TanstackQueryProvider>
    </>
  )
}

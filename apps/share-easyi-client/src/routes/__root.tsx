import { callStore } from '@/call-service/store'
import { CallDialog } from '@/components/call-dialog'
import { TanstackQueryProvider } from '@/integrations/tanstack-query/provider'
import { createRootRoute, Outlet } from '@tanstack/solid-router'
import { Show } from 'solid-js'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <TanstackQueryProvider>
        <div class="bg-background">
          <Outlet />
          <Show when={callStore().status == 'on-call'}>
            <CallDialog />
          </Show>
          {/*<MessageStoreDevtools buttonPosition="up" />*/}
          {/*<TanStackRouterDevtools />*/}
          {/*<SolidQueryDevtools buttonPosition="bottom-right" />*/}
        </div>
      </TanstackQueryProvider>
    </>
  )
}

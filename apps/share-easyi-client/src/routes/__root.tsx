import { Outlet, createRootRoute } from '@tanstack/solid-router'

export const Route = createRootRoute({
  component: function RootComponent() {
    return (
      <div class="bg-background">
        <Outlet />
      </div>
    )
  },
})

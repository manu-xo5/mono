import { Outlet, createRootRoute } from '@tanstack/solid-router'

export const Route = createRootRoute({
  errorComponent: (props) => {
    console.log(props.error)
    return <>Error</>
  },
  component: function RootComponent() {
    return (
      <div class="bg-background">
        <Outlet />
      </div>
    )
  },
})

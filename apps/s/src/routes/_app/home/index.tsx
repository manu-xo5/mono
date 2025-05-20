import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/_app/home/')({
  component: RouteComponent,
})

function RouteComponent() {
  const context = Route.useRouteContext()
  const { user } = context()

  return (
    <div class="flex flex-col justify-center items-center text-muted-foreground">
      <p class="w-96">
        Hello {user.name}!<br />
        <span class="text-sm">
          Select or Search with your friend id to start chatting, sharing with
          them
        </span>
      </p>
    </div>
  )
}

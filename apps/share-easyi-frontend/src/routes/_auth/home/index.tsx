import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/home/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user } = Route.useRouteContext()

  return (
    <div className="flex flex-col justify-center items-center text-muted-foreground">
      <p className="w-96">
        Hello {user.name}!<br />
        <span className="text-sm">
          Select or Search with your friend id to start chatting, sharing with
          them
        </span>
      </p>
    </div>
  )
}

import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { Stack } from '@/components/ui/stack'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/server-down/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageContainer className="flex justify-center pt-6">
      <Stack className="gap-3">
        <img
          className="h-48"
          src="/assets/pinkparrot.png"
          alt="pink parrot logo"
        />

        <h2 className="text-2xl">We'll Be Back Soon</h2>

        <div className="text-muted-foreground">
          <p>Please bear with us! we're currently under maintenance.</p>
          <p>
            It's going to take some time to fix the error. We'll return shortly.
            We appreciate your patience.
          </p>
          <a href="mailto:mohit.matwaya@gmail.com">
            Contact us for further information.
          </a>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => window.location.reload()}
        >
          Try reload
        </Button>
      </Stack>
    </PageContainer>
  )
}

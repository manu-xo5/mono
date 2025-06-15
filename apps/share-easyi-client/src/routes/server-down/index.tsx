import { createFileRoute } from '@tanstack/solid-router'
import { Button, PageContainer, Stack } from '@/shared/components'

export const Route = createFileRoute('/server-down/')({
  component: ServerDown,
})

function ServerDown() {
  return (
    <PageContainer class="flex justify-center pt-6">
      <Stack class="gap-3 max-w-256">
        <img class="h-48" src="/assets/pinkparrot.png" alt="pink parrot logo" />

        <h2 class="text-2xl">We'll Be Back Soon</h2>

        <div class="text-muted-foreground">
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

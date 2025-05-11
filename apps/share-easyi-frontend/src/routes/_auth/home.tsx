import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth'
import { createFileRoute, useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/home')({
  component: RouteComponent,
})

function RouteComponent() {
  const router = useRouter();

  return (
    <PageContainer>
      <Button
        variant="destructive"
        onClick={async () => {
          await authClient.signOut()
          router.invalidate();
        }}
      >
        Sign out
      </Button>
    </PageContainer>
  )
}

import { PageContainer } from '@/components/page-container'
import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/home' })
  },
  component: () => (
    <PageContainer className="flex items-center justify-center pt-12">
      Redirecting...
    </PageContainer>
  ),
})

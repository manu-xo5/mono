import { ServerDown } from '@/components/server-down'
import { createFileRoute } from '@tanstack/solid-router'

export const Route = createFileRoute('/server-down/')({
  component: ServerDown,
})

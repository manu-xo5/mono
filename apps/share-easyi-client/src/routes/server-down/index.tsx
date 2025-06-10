import { createFileRoute } from '@tanstack/solid-router'
import { ServerDown } from '@/components/server-down'

export const Route = createFileRoute('/server-down/')({
  component: ServerDown,
})

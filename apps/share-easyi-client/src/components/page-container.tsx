import type { JSX } from 'solid-js'
import { cn } from '@/utils/utils'

type Props = {
  class?: string
  children: JSX.Element
}
export function PageContainer(props: Props) {
  return (
    <div>
      {/* <div class="h-12" />*/}
      <div
        {...props}
        class={cn('h-[calc(100svh-theme(spacing.0))]', props.class)}
      />
    </div>
  )
}

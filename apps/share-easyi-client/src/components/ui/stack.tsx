import type { ComponentProps } from 'solid-js'
import { cn } from '@/utils/utils'

type Props = ComponentProps<'div'>

export function Stack(props: Props) {
  return (
    <div
      {...props}
      class={cn('flex w-full flex-col items-start', props.class)}
    />
  )
}

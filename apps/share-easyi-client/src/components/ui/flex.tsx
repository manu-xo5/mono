import { cn } from '@/lib/utils'
import type { JSX } from 'solid-js'

type Props = {
  class?: string
  children?: JSX.Element
}

export function Flexbox(props: Props) {
  return <div {...props} class={cn('flex items-center', props.class)} />
}

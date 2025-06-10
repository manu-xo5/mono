import type { JSX } from 'solid-js'
import { cn } from '@/lib/utils'

type Props = {
  class?: string
  children?: JSX.Element
}

export function Flexbox(props: Props) {
  return <div {...props} class={cn('flex items-center', props.class)} />
}

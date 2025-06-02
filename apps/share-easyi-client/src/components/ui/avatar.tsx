import { cn } from '@/utils'

type Props = {
  class?: string
  src: string
}

export function Avatar(props: Props) {
  return (
    <div class={cn('size-10', props.class)}>
      <img
        loading="eager"
        class="size-full border rounded-full"
        src={props.src}
        referrerPolicy="no-referrer"
      />
    </div>
  )
}

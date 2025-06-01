import { cn } from '@/utils'

type Props = {
  class?: string
  src: string
}

export function Avatar(props: Props) {
  return (
    <div class='size-10'>
      <img
        loading="eager"
        class={cn('size-full border rounded-full', props.class)}
        src={props.src}
        referrerPolicy="no-referrer"
      />
    </div>
  )
}

import { cn } from '@/utils/utils'

type Props = {
  class?: string
}
export function Loader(props: Props) {
  return (
    <div
      class={cn(
        'flex-col gap-4 size-20 inline-flex items-center justify-center relative',
        props.class,
      )}
    >
      <div class="absolute z-10 border-4 size-11/12 border-transparent animate-spin border-t-white/30 rounded-full" />
      <div class="absolute z-20 border-4 size-9/12 border-transparent animate-spin duration-700 border-t-white/20 rounded-full" />
    </div>
  )
}

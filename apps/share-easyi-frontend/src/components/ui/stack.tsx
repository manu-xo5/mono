import { cn } from '@/lib/utils'

type Props = React.ComponentPropsWithoutRef<'div'>

export function Stack({ className, ...props }: Props) {
  return <div className={cn('flex flex-col items-start', className)} {...props} />
}

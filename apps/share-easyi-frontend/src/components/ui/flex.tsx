import { cn } from '@/lib/utils'

type Props = {
  className?: string
  children?: React.ReactNode
}

export function Flexbox({ className, ...props }: Props) {
  return <div className={cn('flex items-center', className)} {...props} />
}

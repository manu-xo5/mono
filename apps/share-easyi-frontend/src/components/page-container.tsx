import { cn } from '@/lib/utils'

type Props = {
  className?: string
  children: React.ReactNode
}
export function PageContainer({ className, ...props }: Props) {
  return <div className={cn('pt-12 min-h-svh', className)} {...props} />
}

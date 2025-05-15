import { cn } from '@/lib/utils'

type Props = {
  className?: string
  children: React.ReactNode
}
export function PageContainer({ className, ...props }: Props) {
  return (
    <div>
      <div className="h-12" />
      <div className={cn('min-h-[calc(100svh-theme(spacing.12))]', className)} {...props} />
    </div>
  )
}

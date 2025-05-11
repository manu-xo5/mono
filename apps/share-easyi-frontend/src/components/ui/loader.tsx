import { cn } from '@/lib/utils'
import React from 'react'

type Props = {
  className?: string
}
export function Loader({ className }: Props) {
  return (
    <div
      className={cn(
        'flex-col gap-4 size-20 inline-flex items-center justify-center relative',
        className,
      )}
    >
      <div className="absolute z-10 border-4 size-11/12 border-transparent animate-spin border-t-black/40 rounded-full" />
      <div className="absolute z-20 border-4 size-9/12 border-transparent animate-spin duration-700 border-t-black/60 rounded-full" />
    </div>
  )
}

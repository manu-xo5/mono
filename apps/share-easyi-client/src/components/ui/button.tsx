import { splitProps } from 'solid-js'
import * as ButtonPrimitive from '@kobalte/core/button'
import { cva } from 'class-variance-authority'
import type { JSX, ValidComponent } from 'solid-js'

import type { PolymorphicProps } from '@kobalte/core/polymorphic'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'border-t border-t-white/30 bg-primary/60 text-primary-foreground shadow-sm hover:bg-primary',
        destructive:
          'bg-destructive/70 text-destructive-foreground hover:bg-destructive',
        outline:
          'border border-input hover:bg-accent hover:text-accent-foreground',
        secondary:
          'border-t border-input bg-[#444] text-secondary-foreground shadow-sm hover:bg-[#555]',
        ghost: 'hover:bg-popover hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        default: 'px-4 py-2 has-[>svg]:px-3 min-w-[96px]',
        sm: 'rounded gap-1.5 py-1 px-5 has-[>svg]:px-4.5 min-w-[80px]',
        icon: 'size-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

type ButtonProps<T extends ValidComponent = 'button'> =
  ButtonPrimitive.ButtonRootProps<T> &
    VariantProps<typeof buttonVariants> & {
      class?: string | undefined
      children?: JSX.Element
    }

const Button = <T extends ValidComponent = 'button'>(
  props: PolymorphicProps<T, ButtonProps<T>>,
) => {
  const [local, others] = splitProps(props as ButtonProps, [
    'variant',
    'size',
    'class',
  ])
  return (
    <ButtonPrimitive.Root
      class={cn(
        buttonVariants({ variant: local.variant, size: local.size }),
        local.class,
      )}
      {...others}
    />
  )
}

export { Button, buttonVariants }
export type { ButtonProps }

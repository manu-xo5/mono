import { Show } from 'solid-js'
import type { ComponentProps, JSX } from 'solid-js'
import { Stack } from '@/components/ui/stack'
import { Flexbox } from '@/components/ui/flex'
import { cn } from '@/utils'

function DialogRoot(props: ComponentProps<'dialog'>) {
  return (
    <dialog
      class="absolute left-1/2 top-1/2 -translate-1/2 z-10 bg-transparent"
      {...props}
    >
      {props.children}
    </dialog>
  )
}

function DialogContent(props: { icon?: JSX.Element; children: JSX.Element }) {
  return (
    <Flexbox class="items-start bg-secondary text-secondary-foreground rounded-lg h-auto w-[calc(var(--spacing)*128)] border shadow-[0px_3px_8px_0px] shadow-secondary p-6 gap-6 select-none">
      <Show when={props.icon}>
        <div class="shrink-0">{props.icon}</div>
      </Show>

      <Stack class="">{props.children}</Stack>
    </Flexbox>
  )
}

function DialogTitle(props: { children: JSX.Element }) {
  return <p class="text-base">{props.children}</p>
}

function DialogBody(props: { children: JSX.Element }) {
  return <p class="text-sm text-muted-foreground">{props.children}</p>
}

function DialogFooter(props: { class?: string; children: JSX.Element }) {
  return (
    <div class={cn('w-full mt-4', props.class)}>
      {props.children}
    </div>
  )
}

export const Dialog = {
  Root: DialogRoot,
  Content: DialogContent,
  Title: DialogTitle,
  Body: DialogBody,
  Footer: DialogFooter,
}

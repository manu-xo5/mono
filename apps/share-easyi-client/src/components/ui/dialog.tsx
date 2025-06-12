import type { JSX } from 'solid-js'

type Props = {
  when: boolean
  children: JSX.Element
}

export function Dialog(props: Props) {
  return (
    <dialog open={props.when} class="absolute left-1/2 top-1/2 -translate-1/2 z-10 bg-transparent">
      {props.children}
    </dialog>
  )
}

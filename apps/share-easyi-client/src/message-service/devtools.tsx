import { cn } from '@/utils'
import { createSignal, For, Match, Show, Switch } from 'solid-js'
import { messageStore, roomStore } from './store'

type Json =
  | string
  | number
  | Record<string, unknown>
  | (string | number | Record<string, unknown>)[]

function JsonView(props: {
  data: Json
  name: string
  onClick?: (ev: MouseEvent) => void
}) {
  const isPlainObject = (obj: unknown) =>
    obj &&
    typeof obj === 'object' &&
    Object.getPrototypeOf(obj) === Object.prototype

  return (
    <div class="pl-4">
      <Switch>
        <Match when={typeof props.data === 'string'}>
          <p>
            {props.name}: "{String(props.data)}"
          </p>
        </Match>

        <Match when={typeof props.data === 'number'}>
          <p>
            {props.name}: {String(props.data)}
          </p>
        </Match>

        <Match when={Array.isArray(props.data)}>
          <details onClick={props.onClick}>
            <summary>{props.name}</summary>
            <For each={Object.entries(props.data)}>
              {([key, data]) => <JsonView name={key} data={data} />}
            </For>
          </details>
        </Match>

        <Match when={isPlainObject(props.data)}>
          <details onClick={props.onClick}>
            <summary>{props.name}</summary>
            <For each={Object.entries(props.data)}>
              {([key, data]) => <JsonView name={key} data={data} />}
            </For>
          </details>
        </Match>
      </Switch>
    </div>
  )
}

type Props = {
  buttonPosition: string
}

export function MessageStoreDevtools(props: Props) {
  let startoffset = 0
  let startheight = 0
  let anchorDiv!: HTMLDivElement

  const [mouseDown, setMouseDown] = createSignal(false)
  const [height, setHeight] = createSignal(400)
  const [show, setShow] = createSignal(false)
  const [split, setSplit] = createSignal<keyof typeof messageStore | ''>('')

  document.addEventListener('mousedown', (ev) => {
    if (ev.target != anchorDiv) return
    setMouseDown(true)
    startoffset = ev.clientY
    startheight = height()
  })
  document.addEventListener('mouseup', () => {
    setMouseDown(false)
    startoffset = 0
    startheight = 0
  })
  document.addEventListener('mousemove', (ev) => {
    if (!mouseDown()) return

    setHeight(startheight + (startoffset - ev.clientY))
  })

  void props

  const anchor = (
    <>
      <div
        ref={anchorDiv}
        class="h-2 hover:bg-blue-400 bg-zinc-700 cursor-row-resize"
      />
      <button
        onClick={() => setShow(false)}
        class={cn(
          'size-6 bg-black inline-block',
          props.buttonPosition === 'up'
            ? 'fixed -z-30 left-12'
            : 'fixed left-12',
        )}
        style={{
          top: height() + 8 + 'px',
        }}
      >
        *
      </button>
    </>
  )

  return (
    <>
      <Show when={!show()}>
        <button
          class="size-6 text-[8px] p-2 bg-black border border-white/20 fixed z-10 top-2 left-2"
          onClick={() => {
            console.log('click')
            setShow(true)
          }}
        >
          #$
        </button>
      </Show>

      <Show when={show()}>
        <div
          class={cn(
            'bg-accent fixed inset-x-0 w-full z-10 overflow-auto',
            props.buttonPosition === 'up' ? 'top-0' : 'bottom-0 ',
            mouseDown() ? 'select-none' : '',
          )}
        >
          <Show when={props.buttonPosition === 'bottom'}>{anchor}</Show>

          <div
            class={cn(
              'grid divide-x overflow-auto',
              split() !== '' ? 'grid-cols-2' : 'grid-cols-1',
            )}
            style={{
              height: height() + 'px',
            }}
          >
            <div class="overflow-auto">
              <For each={Object.keys(messageStore)}>
                {(name) => (
                  <JsonView
                    name={name}
                    data={messageStore[name as keyof typeof messageStore]}
                    onClick={(ev) => {
                      if (!ev.ctrlKey) return
                      ev.preventDefault()
                      setSplit(name as keyof typeof messageStore)
                    }}
                  />
                )}
              </For>

              <JsonView name={'roomStore'} data={roomStore} />
            </div>

            <Show when={split()}>
              <div class="overflow-auto">
                <JsonView
                  name={split()}
                  data={messageStore[split() as keyof typeof messageStore]}
                />
              </div>
            </Show>
          </div>

          <Show when={props.buttonPosition === 'up'}>{anchor}</Show>
        </div>
      </Show>
    </>
  )
}

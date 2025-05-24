import { createSignal, For, onCleanup } from 'solid-js'

export function CallRipple() {
  const [rippleSize, setRippleSize] = createSignal(0)

  const timer = setInterval(() => {
    setRippleSize((p) => ++p % 100)
  }, 20)

  onCleanup(() => {
    clearInterval(timer)
  })

  const items = () =>
    Array.from({ length: 3 }).map((_, i) => {
      const imageSize = 80
      const size = imageSize + (rippleSize() - i * 20)
      const opacity = i / 3 + (1 - rippleSize() / 55)

      return {
        size,
        opacity,
      }
    })

  return (
    <For each={items()}>
      {({ opacity, size }) => (
        <div
          class="absolute z-10 border-2 border-primary bg-transparent left-1/2 top-1/2 -translate-1/2 rounded-full"
          style={{
            opacity,
            width: size + 'px',
            height: size + 'px',
          }}
        />
      )}
    </For>
  )
}

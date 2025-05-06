import { Button } from '@/components/ui/button'
import * as callCo from '@/lib/call/co.index'
import { useCallStore } from '@/store'
import { useUserStore } from '@/store/user-store'
import { ensurePeer } from '@/store/user-store/utils'
import { createFileRoute } from '@tanstack/react-router'
import { run } from 'effection'
import { CopyIcon, RefreshCwIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

// setInterval(() => { console.debug("open connections", peer.connections) }, 5000);

export const Route = createFileRoute('/')({
  beforeLoad: () => ensurePeer(),
  component: App,
})

function App() {
  const [ws, setWs] = useState<null | WebSocket>(null)
  const [message, setMessage] = useState<string[]>([])
  const [otherPeerId, _setOtherPeerId] = useState(
    () => localStorage.getItem('share-easyi:other') ?? '',
  )

  const setOtherPeerId = (value: string) => {
    localStorage.setItem('share-easyi:other', value)
    _setOtherPeerId(value)
  }
  const peer = useUserStore((s) => s.peer)!

  function handlePingPong(ws: WebSocket, msg: MessageEvent) {
    if (msg.data === 'ping') {
      console.log('ping pong')
      ws.send('pong')
    }
  }
  function handleMessage(_ws: WebSocket, msg: MessageEvent) {
    setMessage((prev) => prev.slice(-100).concat(String(msg.data)))
  }

  useEffect(() => {
    const ws_ = new WebSocket('ws://localhost:1553/ws')

    function handleOpen() {
      setWs(ws_)
      ws_.removeEventListener('open', handleOpen)
    }

    ws_.addEventListener('open', handleOpen)

    return () => {
      console.log(ws_.readyState)
      setWs(null)
      try {
        ws_.close()
      } catch {
        void 0
      }
    }
  }, [])

  useEffect(() => {
    if (!ws) return

    const ws_ = ws

    function pipeMessageToHandler(msg: MessageEvent) {
      handlePingPong(ws_, msg)
      handleMessage(ws_, msg)
    }

    ws.addEventListener('message', pipeMessageToHandler)
    return () => ws.removeEventListener('message', pipeMessageToHandler)
  }, [ws])

  if (!ws) {
    return <div>loading....</div>
  }

  return (
    <>
      <div className="pt-12 h-svh">
        <div className="bg-card flex flex-col w-md rounded-lg border-2 gap-y-3">
          <ul>
            {message.map((text, i) => (
              <li key={i + text}>{text}</li>
            ))}
          </ul>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget)
              const message = fd.get('message')
              if (message == null) {
                console.error(`msg not sent: EEMPTY`)
                return
              }

              ws.send(String(message))
            }}
          >
            <input
              placeholder="other peer id"
              className="px-3 py-1 border-input border rounded-md flex-1 w-full"
              name="message"
            />
            <Button type="submit">Send</Button>
          </form>
        </div>
        <div className="max-w-sm bg-card text-secondary-foreground p-6 m-3 rounded-md inline-block">
          <div className="flex items-center text-muted-foreground p-3 pt-0 gap-3">
            <p className="flex-1 min-w-0 truncate">{peer.id}</p>

            <Button
              size="icon"
              variant="outline"
              onClick={() => navigator.clipboard.writeText(peer.id)}
            >
              <CopyIcon />
            </Button>

            <Button
              size="icon"
              variant="outline"
              onClick={() => {
                localStorage.setItem('share-easyi', '')
                window.location.reload()
              }}
            >
              <RefreshCwIcon />
            </Button>
          </div>

          <div className="flex gap-3">
            <input
              placeholder="other peer id"
              className="px-3 py-1 border-input border rounded-md flex-1 w-full"
              value={otherPeerId}
              onChange={(ev) => setOtherPeerId(ev.currentTarget.value)}
            />

            <Button
              variant="outline"
              onClick={async () => {
                if (!otherPeerId) {
                  console.error("other peer id is 'null'")
                  return
                }

                if (useCallStore.getState().status !== 'idle') {
                  return
                }

                await run(function* () {
                  yield* callCo.makeRequest(peer, otherPeerId)
                })
              }}
            >
              Make Call
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}

import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Stack } from '@/components/ui/stack'
import { signOutUser } from '@/lib/auth'
import { createStorage } from '@/lib/create-storage'
import { createFileRoute, Outlet, useRouter } from '@tanstack/react-router'
import { useEffect, useState, createContext } from 'react'

export const Route = createFileRoute('/_auth/home')({
  component: LayoutComponent,
})

function useWebSocket() {
  const [ws, setWs] = useState<null | WebSocket>(null)

  useEffect(() => {
    const socket = new WebSocket('http://localhost:1553/ws')

    socket.addEventListener('open', () => {
      setWs(socket)
    })

    return () => {
      if (socket.readyState === WebSocket.OPEN) {
        console.log('ws1', socket.readyState)
        socket.close(1000, 'GoingAway')
        return
      }

      console.log('ws2', socket.readyState)
      socket.onopen = () => {
        socket.close(1000, 'GoingAway')
      }
    }
  }, [])

  const wsStatus =
    ws == null
      ? ('CLOSED' as const)
      : (['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'] as const)[ws.readyState]!

  return {
    ws,
    wsStatus,
  }
}

export const WsContext = createContext<{
  ws: WebSocket | null
  wsStatus: string
}>({
  wsStatus: 'CLOSED',
  ws: null,
})

const recentAddrStorage = createStorage({
  getItem: (name) => localStorage.getItem(name),
  setItem: (name, value) => localStorage.setItem(name, value),
})

function LayoutComponent() {
  const router = useRouter()
  const navigate = Route.useNavigate()
  const wsState = useWebSocket()

  function navigateToRoom(roomId: string) {
    navigate({
      to: '/home/$roomId',
      params: {
        roomId: roomId,
      },
      mask: {
        to: '/home',
      },
    })
  }

  return (
    <WsContext value={wsState}>
      <PageContainer className="grid grid-cols-[300px_1fr]">
        <Stack className="bg-muted/20 border-r p-3 gap-3">
          <Input
            placeholder="User Id"
            onKeyDown={(ev) => {
              if (ev.key !== 'Enter') return
              const value = ev.currentTarget.value

              const all = recentAddrStorage
                .getItem<string[]>('all')
                .unwrapOr([])

              if (!all.includes(value)) {
                recentAddrStorage.setItem('all', all.concat(value))
              }

              navigateToRoom(value);
            }}
          />

          <Button
            className="w-full"
            variant="destructive"
            onClick={async () => {
              signOutUser()
              router.invalidate()
            }}
          >
            Sign out
          </Button>

          <ul className="divide-y border-y flex flex-col w-full">
            {recentAddrStorage
              .getItem<string[]>('all')
              .unwrapOr(['Hello'])
              .map((addr) => (
                <li className="w-full py-1" key={addr}>
                  <Button
                    variant="ghost"
                    className="flex justify-start items-center p-3 gap-3 h-auto w-full"
                    onClick={() => navigateToRoom(addr)}
                  >
                    <span className="size-10 border-white/20 border bg-black rounded-full" />
                    <Stack>
                      {addr.length > 20
                        ? addr.substring(0, 17).concat('...')
                        : addr}
                      <span className="text-xs text-muted-foreground pointer-events-none">
                        Lorem Ipsume text sample
                      </span>
                    </Stack>
                  </Button>
                </li>
              ))}
          </ul>
        </Stack>

        <Outlet />
      </PageContainer>
    </WsContext>
  )
}

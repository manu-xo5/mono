import { PageContainer } from '@/components/page-container'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Stack } from '@/components/ui/stack'
import { authClient, signOutUser } from '@/lib/auth'
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/_auth/home')({
  component: RouteComponent,
})

function useWebSocket() {
  const [ws, setWs] = useState<null | WebSocket>(null)

  useEffect(() => {
    const socket = new WebSocket('http://localhost:1553/ws')

    socket.addEventListener('open', () => {
      setWs(socket)
    })

    return () => {
      console.log(
        ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'][socket.readyState],
      )
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

  return {
    ws,
  }
}

function RouteComponent() {
  const router = useRouter()
  const ws = useWebSocket()
  void ws;

  return (
    <PageContainer>
      <Stack>
        <Input />
        <Button onClick={() => {}}>Send</Button>
      </Stack>

      <Button
        variant="destructive"
        onClick={async () => {
          signOutUser()
          router.invalidate()
        }}
      >
        Sign out
      </Button>
    </PageContainer>
  )
}

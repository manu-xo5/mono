import type { DataConnection, Peer, PeerConnectOption } from 'peerjs'

export async function createDataConn(peer: Peer, otherPeerId: string, options?: PeerConnectOption) {
  return new Promise<DataConnection>((res, reject) => {
    const conn = peer.connect(otherPeerId, options)

    const timer = setTimeout(() => {
      conn.off('open', handleOpen)
      conn.close();
      const error = new Error('Timeout: Connection failed to open')
      console.error(error)
      reject(error)
    }, 2000)

    function handleOpen() {
      clearTimeout(timer)
      res(conn)
    }

    conn.on('open', handleOpen)
  })
}


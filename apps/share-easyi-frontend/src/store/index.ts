import type { CallSlice } from '@/store/call-slice/index.js'
import type { DataConnection, MediaConnection } from 'peerjs'
import { getDisplayNameFromPeerId } from '@/lib/utils.js'
import { createCallSlice, handleCallDataConn } from '@/store/call-slice/index.js'
import { Peer } from 'peerjs'
import { create } from 'zustand'

export type Action<Type extends string, Payload extends Record<string, unknown> | undefined> =
  Payload extends undefined ?
      {
        type: Type
      }
    : {
        type: Type
        payload: Payload
      }

export interface UserStore {
  status: 'standby' | 'incoming-call' | 'outgoing-call' | 'on-call' | 'call-failed' | 'call-rejected'
  peer: Peer | null
  displayName: string
  conns: Map<string, DataConnection>
  callMediaConn: MediaConnection | null
  callDataConn: DataConnection | null
  callSlice: CallSlice
}

export const useStore = create<UserStore>()((...args) => ({
  status: 'standby',
  peer: null,
  displayName: '',
  conns: new Map(),
  callDataConn: null,
  callMediaConn: null,
  callSlice: createCallSlice(...args),
}))

let initPromise: Promise<void> | undefined
export async function initUser(peerId: string) {
  if (initPromise)
    return initPromise
  const peer = new Peer(peerId)

  const { promise, resolve, reject } = Promise.withResolvers<void>()
  initPromise = promise

  // handle maybe loggedin somewhere
  // peer.addListener("close", () => console.log("lund"));

  peer.addListener('open', () => resolve())
  peer.addListener('error', () => reject())
  peer.addListener('disconnected', () => peer.reconnect())
  peer.addListener('call', call => call.answer())
  peer.addListener('connection', handleConnection)

  // todo: remove later
  peer.on('connection', (conn) => {
    conn.on('data', (data) => {
      console.log('other\'s msg:', data)
    })
  })

  await initPromise
  useStore.setState({ displayName: getDisplayNameFromPeerId(peerId), peer })
  initPromise = undefined
}

export async function ensureUser(peerId: string) {
  if (useStore.getState().peer != null)
    return

  await initUser(peerId)
}

function handleConnection(conn: DataConnection) {
  conn.on('close', () => console.log('closed'))
  if (conn.metadata.type === 'call') {
    handleCallDataConn(conn)
  }
  else {
    handleMessageDataConn(conn)
  }
}

function handleMessageDataConn(conn: DataConnection) {
  void conn
  console.error('todo: not implemented')
}

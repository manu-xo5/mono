import type { UserStore } from '@/store/index.js'
import type { DataConnection, MediaConnection } from 'peerjs'
import type { StateCreator } from 'zustand'

export type CallSlice = {
  status: 'standby' | 'incoming-call' | 'outgoing-call' | 'call-request-failed' | 'on-call' | 'call-request-rejected'
  dataConn: DataConnection | null
  mediaConn: MediaConnection | null
  timeout: number
}

export const createCallSlice: StateCreator<UserStore, [], [], CallSlice> = () => ({
  mediaConn: null,
  dataConn: null,
  status: 'standby',
  timeout: 0,
})

export { handleCallDataConn } from './module.js'

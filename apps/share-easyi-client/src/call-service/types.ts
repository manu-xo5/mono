export type CallStatus =
  | 'idle'
  | 'incoming'
  | 'loading'
  | 'rejected'
  | 'accepted'
  | 'peer-offline'
  | 'disconnecting'
  | 'failed'

export type CallStore = {
  id: string
  status: 'idle' | 'on-call'
  callStatus: CallStatus
  streams: Array<MediaStream>
}

export type TCallApiError =
  | 'no-mic-device'
  | 'permission-denied'
  | 'unknown-error'
  | ''

export type TOther = {
  userId: string
  displayName: string
}

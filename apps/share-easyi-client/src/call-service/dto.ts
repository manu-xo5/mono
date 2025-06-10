import type TPeer from 'simple-peer'

export function CallRequestDTO({
  from,
  to,
  displayName = '<unknown>',
}: {
  from: string
  to: string
  displayName?: string
}) {
  return {
    type: 'call-request',
    from,
    to,
    payload: {
      displayName,
    },
  }
}

export function CallSignalDTO({
  from,
  to,
  signal,
}: {
  from: string
  to: string
  signal: TPeer.SignalData
}) {
  return {
    type: 'call-signal',
    from,
    to,
    payload: {
      signal,
    },
  }
}

export function CallResponseDTO({
  from,
  to,
  response,
}: {
  from: string
  to: string
  response: 'accepted' | 'rejected'
}) {
  return {
    type: 'call-response',
    from,
    to,
    response,
  }
}
export type TCallResponse = ReturnType<typeof CallResponseDTO>

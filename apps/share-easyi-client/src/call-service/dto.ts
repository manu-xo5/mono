import type TPeer from 'simple-peer'

export function CallRequestDTO({ from, to }: { from: string; to: string }) {
  return {
    type: 'call-request',
    from,
    to,
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
    payload: {
      from,
      to,
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
  response: TPeer.SignalData
}) {
  return {
    type: 'call-response',
    from,
    to,
    response,
  }
}
export type TCallResponse = ReturnType<typeof CallResponseDTO>

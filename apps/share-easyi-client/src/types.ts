import type { SignalData } from 'simple-peer'

export type MakeCallRequest = {
  type: 'make-call-request'
  to: string
  from: string
  body: {
    peerSignal: SignalData
  }
}

export type MakeCallResponse = {
  type: 'make-call-response'
  to: string
  from: string
  body: {
    response: 'accepted' | 'rejected'
    peerSignal: SignalData
  }
}

export type MessageDeliveryEvent =
  | {
      type: 'message-delivery'
      status: 'ok'
      body: {
        id: string
        roomId: string
        updatedAt: string
        type: 'text'
        from: string
        to: string
        body: string
        deleted: boolean | null
      }
    }
  | {
      type: 'message-delivery'
      status: 'fail'
      body: {
        id: string
        error: string
      }
    }

export type MessageReceiveEvent = {
  type: 'message-receive'
  roomId: string
  body: {
    id: string
    type: 'text'
    from: string
    to: string
    roomId: string
    body: string
    updatedAt: string
  }
}

export type Event =
  | MessageDeliveryEvent
  | MessageReceiveEvent
  | MakeCallRequest
  | MakeCallResponse

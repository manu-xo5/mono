import type { Event } from '@/types'

export enum CallEvent {
  Accept = 'Call:Accept',
  End = 'Call:End',
  Reject = 'Call:Reject',
}

export type CallDispatchEnd = {
  type: CallEvent.Reject
  payload: {
    otherUserId: string
  }
}

export type CallDispatchMake = {
  type: CallEvent.Accept
  payload: {
    otherUserId: string
  }
}

export type CallDispatch =
  | {
      type: CallEvent.End
    }
  | CallDispatchEnd
  | CallDispatchMake
  | Event

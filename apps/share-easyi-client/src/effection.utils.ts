import { sleep, type Operation } from 'effection'

export const ETimeoutSymbol = Symbol('EffectionTimeout')

export function* timeout(ms: number): Operation<typeof ETimeoutSymbol> {
  yield* sleep(ms)

  return ETimeoutSymbol
}

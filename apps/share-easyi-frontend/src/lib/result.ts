type Ok<V> = {
  value: V
  error: null
}

type Fail<E> = {
  value: null
  error: E
}

export type Result<V, E> = Ok<V> | Fail<E>

export namespace Result {
  export function ok<Value>(value: Value): Ok<Value> {
    return {
      value: value,
      error: null,
    }
  }

  export function fail<Error>(error: Error): Fail<Error> {
    return {
      value: null,
      error: error,
    }
  }
}

export class Option<V> {
  static some<R>(value: R) {
    return new Option(value)
  }

  static none: Option<never> = new Option(null as never)

  private _tag: 'some' | 'none'
  private value: V

  constructor(value: V) {
    if (value == null) {
      this._tag = 'none'
    } else {
      this._tag = 'some'
    }

    this.value = value
  }

  map<R>(fn: (value: V) => R): Option<R> {
    if (this._tag == 'none') {
      return this as unknown as Option<R>
    }

    const _value = fn(this.value)

    return new Option<R>(_value)
  }

  unwrapOr<F extends V>(fallback: F): V {
    return this.value ?? fallback
  }
}

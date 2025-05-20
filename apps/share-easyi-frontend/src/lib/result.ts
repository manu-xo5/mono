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
  static async fromPromise<T>(tar: Promise<T>) {
    try {
      const value = await tar
      return Option.some(value)
    } catch (error) {
      console.error(error)
      return Option.none
    }
  }

  static fromSync<T>(tar: () => T) {
    try {
      const value = tar()
      return Option.some(value)
    } catch (error) {
      console.error(error)
      return Option.none
    }
  }

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

  unwrapOr<F>(fallback: F): V | F {
    return this.value ?? fallback
  }

  unwrap(): V {
    if (this.value == null) {
      throw 'panic: unwrap() on Option and value was null'
    }
    return this.value
  }
}

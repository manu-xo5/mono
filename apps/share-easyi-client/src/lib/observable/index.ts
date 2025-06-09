export class Observable<T> {
  private listeners: Array<(value: T) => void> = []
  private value: T

  subscribe(listener: (value: T) => void): () => void {
    this.listeners.push(listener)

    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener)
    }
  }

  constructor(initialValue: T) {
    this.value = initialValue
  }

  notify(value: T): void {
    if (value === this.value) return
    for (const listener of this.listeners) {
      listener(value)
    }
    this.value = value
  }

  getValue(): T {
    return this.value
  }
}

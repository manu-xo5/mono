import { Observable, fromEventPattern, distinctUntilChanged } from "rxjs";
import { create, StoreApi, UseBoundStore } from "zustand";

const x = create<{ value: number }>()(() => ({ value: 0 }));

export function select$<T, R>(store: UseBoundStore<StoreApi<T>>, selector: (store: T) => R): Observable<T> {
  return fromEventPattern<T>(
    (handler) => {
      handler()
      return store.subscribe(selector);
    },
    (_handler, unsubscribe) => unsubscribe()
  ).pipe(distinctUntilChanged());
}

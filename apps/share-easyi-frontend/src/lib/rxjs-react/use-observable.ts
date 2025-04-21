import { useEffect, useState } from "react";
import { Observable } from "rxjs";

export function useObservable<T>(observable: Observable<T>, initialValue: T) {
  const [state, setState] = useState<T>(initialValue);

  useEffect(() => {
    observable.subscribe({
      next: setState,
      error: (error) => console.log(error.message ?? error)
    });
  }, [observable]);

  return state;
}

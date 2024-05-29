import { comparer, reaction } from "mobx";
import { useEffect, useRef, useState } from "react";

export function useObserver<T>(get: () => T, deps: any[] = []): T {
  const [state, setState] = useState(get);
  const isInitialRef = useRef(true);
  useEffect(() => {
    const isInitial = isInitialRef.current;
    isInitialRef.current = false;
    return reaction(get, setState, {
      equals: comparer.structural,
      fireImmediately: !isInitial,
    });
  }, [...deps]);
  return state;
}

export function useReaction<I, O>(
  get: () => I,
  transform: (value: I) => O,
  deps: any[]
): O {
  const [state, setState] = useState(() => transform(get()));
  const isInitialRef = useRef(true);
  useEffect(() => {
    const isInitial = isInitialRef.current;
    isInitialRef.current = false;
    return reaction(
      get,
      (update: I) => {
        setState(transform(update));
      },
      {
        equals: comparer.structural,
        fireImmediately: !isInitial,
      }
    );
  }, [...deps]);
  return state;
}

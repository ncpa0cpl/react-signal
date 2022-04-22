import React from "react";

export class Signal<T> {
  static useOnReceive<T>(s: Signal<T>, callback: (payload: T) => void) {
    React.useEffect(() => {
      const { remove } = s.onEvent(callback);

      return remove;
    }, [s, callback]);
  }

  private listeners = new Map<symbol, (payload: T) => void>();

  private onEvent(callback: (payload: T) => void) {
    const id = Symbol();
    this.listeners.set(id, callback);
    return {
      remove: () => {
        this.listeners.delete(id);
      },
    };
  }

  send(payload: T): void {
    for (const listener of this.listeners.values()) {
      listener(payload);
    }
  }
}

export const createSignal = <T>() => new Signal<T>();

export const useCreateSignal = <T>() =>
  React.useState(() => createSignal<T>())[0];

export const useOnReceive = <T>(
  signal: Signal<T>,
  callback: (payload: T) => void
) => Signal.useOnReceive(signal, callback);

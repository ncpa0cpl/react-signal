import { act, render } from "@testing-library/react";
import React from "react";
import { createSignal, Signal, useOnReceive } from "../src";

describe("signal", () => {
  it("should propagate signal events to it's children", () => {
    let parentSignal: Signal<{ foo: string }> | undefined = undefined;
    const onChildReceivedSignal = jest.fn();

    const Child: React.FC<{ signal: Signal<{ foo: string }> }> = ({
      signal,
    }) => {
      useOnReceive(signal, onChildReceivedSignal);

      return <div></div>;
    };

    const Parent: React.FC = () => {
      const [signal] = React.useState(() => createSignal<{ foo: string }>());

      parentSignal = signal;

      return <Child signal={signal} />;
    };

    render(<Parent />);

    expect(onChildReceivedSignal).toHaveBeenCalledTimes(0);

    act(() => parentSignal?.send({ foo: "foobar" }));

    expect(onChildReceivedSignal).toHaveBeenCalledTimes(1);
    expect(onChildReceivedSignal).toHaveBeenCalledWith({ foo: "foobar" });
  });

  it("should propagate signal events to all of it's children", () => {
    let parentSignal: Signal<{ foo: string }> | undefined = undefined;
    const onChildReceivedSignal = jest.fn();

    const Child: React.FC<{
      index: number;
      signal: Signal<{ foo: string }>;
    }> = ({ signal, index }) => {
      useOnReceive(signal, ({ foo }) => onChildReceivedSignal({ foo, index }));

      return <div></div>;
    };

    const Parent: React.FC = () => {
      const [signal] = React.useState(() => createSignal<{ foo: string }>());

      parentSignal = signal;

      return (
        <div>
          <Child index={1} signal={signal} />
          <Child index={2} signal={signal} />
          <Child index={3} signal={signal} />
        </div>
      );
    };

    render(<Parent />);

    expect(onChildReceivedSignal).toHaveBeenCalledTimes(0);

    act(() => parentSignal?.send({ foo: "foobar" }));

    expect(onChildReceivedSignal).toHaveBeenCalledTimes(3);
    expect(onChildReceivedSignal).toHaveBeenNthCalledWith(1, {
      foo: "foobar",
      index: 1,
    });
    expect(onChildReceivedSignal).toHaveBeenNthCalledWith(2, {
      foo: "foobar",
      index: 2,
    });
    expect(onChildReceivedSignal).toHaveBeenNthCalledWith(3, {
      foo: "foobar",
      index: 3,
    });
  });
});

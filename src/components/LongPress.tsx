import React, { useCallback, useRef, useState } from "react";
import { RGB } from "../functions/colors";
import { Key } from "./Key";

export interface LongPressProps {
  position: number;
  idleColor: RGB;
  activeColor: RGB;
  delayMillis?: number;
  onKeypress: () => void;
}

export const LongPress: React.FC<LongPressProps> = ({
  onKeypress,
  delayMillis = 1000,
  idleColor,
  activeColor,
  position,
}) => {
  const [color, setColor] = useState(idleColor);
  const onTrigger = useCallback(() => {
    onKeypress();
    setTimeout(() => setColor(idleColor));
  }, [onKeypress]);
  const activation = useDelayedActivation(onTrigger, delayMillis);

  const onKeydown = useCallback(() => {
    activation.startTimer();
    setColor(activeColor);
  }, [onTrigger, JSON.stringify(activeColor), delayMillis]);
  const onKeyup = useCallback(() => {
    activation.cancel();
    setColor(idleColor);
  }, [onTrigger, JSON.stringify(idleColor)]);

  return (
    <Key
      position={position}
      color={color}
      onKeydown={onKeydown}
      onKeyup={onKeyup}
    />
  );
};

function useDelayedActivation(
  callback: () => void,
  delayMillis: number
): {
  startTimer: () => void;
  cancel: () => void;
} {
  const timer = useRef<undefined | ReturnType<typeof setTimeout>>();
  const startTimer = useCallback(() => {
    timer.current = setTimeout(callback, delayMillis);
  }, [delayMillis, callback]);
  const cancel = useCallback(() => clearTimeout(timer.current), []);
  return { startTimer, cancel };
}

import React, { useCallback, useContext, useEffect } from "react";
import { SynthAndGridContext, WithSynthAndGrid } from "./WithSynthAndGrid";

export const SleepMode: React.FC<{
  sleeping: boolean;
  setSleeping: (sleeping: boolean) => void;
  delayMillis?: number;
}> = ({ sleeping, setSleeping, delayMillis = 60000 }) => {
  const { gridController } = useContext(SynthAndGridContext);
  const beAwake = useCallback(() => setSleeping(false), [setSleeping]);
  const beSleeping = useCallback(() => setSleeping(true), [setSleeping]);
  useEffect(() => {
    if (sleeping) {
      gridController.addEventListener("*", beAwake);
      return () => gridController.removeEventListener("*", beAwake);
    } else {
      let sleepTimer: undefined | ReturnType<typeof setTimeout>;
      function startTimer() {
        clearTimeout(sleepTimer);
        sleepTimer = setTimeout(beSleeping, delayMillis);
      }
      startTimer();
      gridController.addEventListener("*", startTimer);
      return () => {
        gridController.removeEventListener("*", startTimer);
        clearTimeout(sleepTimer);
      };
    }
  }, [sleeping, beAwake, beSleeping]);
  return null;
};

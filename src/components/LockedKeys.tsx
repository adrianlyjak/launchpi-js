import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { brighten, RGB } from "../functions/colors";
import { createLogger } from "../logger";
import { Key } from "./Key";
import { SynthAndGridContext } from "./WithSynthAndGrid";

export const LockedKeys: React.FC<{
  delayMillis?: number;
  relockAfter?: number;
  positions: number[];
  lockedColor?: RGB;
  unlockingColor?: RGB;
  children: ReactNode;
}> = ({
  delayMillis = 2000,
  relockAfter = 20000,
  positions,
  lockedColor = [0.1, 0.1, 0.1],
  unlockingColor,
  children,
}) => {
  const logger = createLogger(`LockedKeys:${positions.join(",")}`);
  const { gridController } = useContext(SynthAndGridContext);
  const [locked, setLocked] = useState(true);
  const [keyPresses, setKeypresses] = useState(0);
  const incr = useCallback(() => setKeypresses((s) => s + 1), []);
  const decr = useCallback(() => setKeypresses((s) => Math.max(0, s - 1)), []);

  // unlock on long press
  useEffect(() => {
    if (keyPresses === 1) {
      logger.debug("start unlock");
      const timer = setTimeout(() => {
        logger.info("unlocked");
        setLocked(false);
        setKeypresses(0);
      }, delayMillis);
      return () => clearTimeout(timer);
    }
  }, [Math.min(keyPresses, 1)]);
  // relock on idle
  useEffect(() => {
    if (!locked) {
      let timer: undefined | ReturnType<typeof setTimeout>;
      function relockOnIdle() {
        logger.debug("start re-lock timer");
        clearTimeout(timer);
        timer = setTimeout(() => {
          logger.info("relock");
          setLocked(true);
        }, relockAfter);
      }
      gridController.addEventListener(positions, relockOnIdle);
      return () => {
        clearTimeout(timer);
        gridController.removeEventListener(positions, relockOnIdle);
      };
    }
  }, [locked]);
  const brightened =
    unlockingColor || brighten(lockedColor, { factor: 5, minWhite: 0.1 });
  const orActiveColor = keyPresses > 0 ? brightened : lockedColor;
  const cachedColor = useMemo(
    () => orActiveColor,
    [JSON.stringify(orActiveColor)]
  );

  if (locked) {
    return (
      <>
        {positions.map((x, i) => {
          return (
            <Key
              key={x}
              color={cachedColor}
              position={x}
              onKeydown={incr}
              onKeyup={decr}
            />
          );
        })}
      </>
    );
  } else {
    return <>{children}</>;
  }
};

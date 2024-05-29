import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { brighten, RGB } from "../functions/colors";
import { createLogger } from "../logger";
import { Key } from "./Key";
import { SynthAndGridContext } from "./WithSynthAndGrid";

interface SharedLockState {
  isLocked: boolean;
  isUnlocking: boolean;
  onTrigger: () => void;
}

export const SharedLockContext = React.createContext<SharedLockState>({
  isLocked: true,
  isUnlocking: false,
  onTrigger: () => {},
});

export const SharedLock: React.FC<{
  delayMillis?: number;
  relockAfter?: number;
  position: number;
  lockedColor?: RGB;
  unlockingColor?: RGB;
  children: ReactNode;
}> = ({
  delayMillis = 2000,
  relockAfter = 20000,
  position,
  lockedColor = [0.1, 0.1, 0.1],
  unlockingColor,
  children,
}) => {
  const logger = createLogger(`SharedLock`);
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

  const relockTimer = useRef<ReturnType<typeof setTimeout>>();
  function relockOnIdle() {
    logger.debug("start re-lock timer");
    clearTimeout(relockTimer.current);
    relockTimer.current = setTimeout(() => {
      logger.info("relock");
      setLocked(true);
    }, relockAfter);
  }

  useEffect(() => {
    if (!locked) relockOnIdle();
  }, [locked]);
  // relock on idle

  const onTrigger = useCallback(relockOnIdle, []);
  const computedValue: SharedLockState = {
    isLocked: locked,
    isUnlocking: keyPresses > 0,
    onTrigger,
  };
  const cachedValue: SharedLockState = useMemo(
    () => computedValue,
    [JSON.stringify(computedValue)]
  );

  const brightened =
    unlockingColor || brighten(lockedColor, { factor: 5, minWhite: 0.1 });
  const orActiveColor = keyPresses > 0 ? brightened : lockedColor;
  const cachedColor = useMemo(
    () => orActiveColor,
    [JSON.stringify(orActiveColor)]
  );

  return (
    <SharedLockContext.Provider value={cachedValue}>
      {locked ? (
        <Key
          color={cachedColor}
          position={position}
          onKeydown={incr}
          onKeyup={decr}
        />
      ) : (
        <Key
          color={cachedColor}
          position={position}
          onKeydown={() => setLocked(true)}
        />
      )}
      {children}
    </SharedLockContext.Provider>
  );
};

export const SharedLockedKeys: React.FC<{
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
  const logger = createLogger(`SharedLockedKeys:${positions.join(",")}`);
  const { isLocked, isUnlocking, onTrigger } = useContext(SharedLockContext);
  const { gridController } = useContext(SynthAndGridContext);

  const brightened =
    unlockingColor || brighten(lockedColor, { factor: 5, minWhite: 0.1 });
  const orActiveColor = isUnlocking ? brightened : lockedColor;
  const cachedColor = useMemo(
    () => orActiveColor,
    [JSON.stringify(orActiveColor)]
  );
  useEffect(() => {
    if (!isLocked) {
      gridController.addEventListener(positions, onTrigger);
      return () => gridController.removeEventListener(positions, onTrigger);
    }
  }, [isLocked, JSON.stringify(positions)]);

  if (isLocked) {
    return (
      <>
        {positions.map((x, i) => {
          return <Key key={x} color={cachedColor} position={x} />;
        })}
      </>
    );
  } else {
    return <>{children}</>;
  }
};

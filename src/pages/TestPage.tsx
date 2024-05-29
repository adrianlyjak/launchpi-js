import React, { useCallback, useMemo, useState } from "react";
import { Key } from "../components/Key";
import { RGB } from "../functions/colors";

export const TestPage: React.FC<{}> = ({}) => {
  const [active, setActive] = useState(false);
  const beInactive = useCallback(() => setActive(false), []);
  const beActive = useCallback(() => setActive(true), []);
  const color = useMemo<RGB>(() => (active ? [0, 1, 0] : [0, 0, 1]), [active]);

  return (
    <Key position={0} onKeydown={beActive} onKeyup={beInactive} color={color} />
  );
};

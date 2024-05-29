/**
 * given a 0-based index into an array, returns a new index into the array, shifted up or down by delta.
 * If the shift exceeds the size of the array, wrap the selection around to be beginning
 * ```
 * shiftArrayPointer({ index: 2, delta: -6, size: 5 })
 *                 [ . . . . . ]
 *                       ^
 *                 [ . . . . . ]
 *    [ . . . . . ]
 *        ^ - - -    - - <
 * return 1
 *
 * ```
 * @param index the initial index into the array
 * @param delta how much to shift the index by
 * @param arraySize the size of the array, for wrapping
 */
export default function shiftArrayPointer({
  index,
  delta,
  size: arraySize,
}: {
  index: number;
  delta: number;
  size: number;
}) {
  let updated = index + delta;
  if (updated < 0) {
    updated = updated + Math.floor(updated / arraySize) * -1 * arraySize;
  }
  updated = updated % arraySize;
  return updated;
}

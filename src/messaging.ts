export type Cancel = () => void;

export function sleep(millis: number): Promise<void> {
  return new Promise((res) => setTimeout(res, millis));
}

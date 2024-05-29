import { createLogger } from "../logger";
import { Activation } from "./NoteActivation";

export interface ActivationPlayerProps {
  maxActivations?: number;
}

export interface ActivationPlayer {
  addActivation(activation: Activation, onComplete?: () => void): void;
  setMaxActivations(count: number | undefined): void;
  clearAll(): void;
  step(): void;
}

interface ActivationContainer {
  onComplete: () => void;
  activation: Activation;
}

export function ActivationPlayer(
  props: ActivationPlayerProps = {}
): ActivationPlayer {
  let activations: ActivationContainer[] = [];
  const logger = createLogger("ActivationPlayer");
  let maxActivations =
    props.maxActivations && Math.max(props.maxActivations, 0);
  function truncateActivations(): void {
    if (maxActivations !== undefined) {
      while (activations.length > maxActivations) {
        const act = activations.shift()!;
        act.activation.cancelImmediate();
        act.onComplete();
      }
    }
  }
  return {
    addActivation(activation, onComplete = () => {}) {
      activations.push({ activation, onComplete });
      truncateActivations();
    },
    setMaxActivations(count) {
      maxActivations = count && Math.max(count, 0);
      truncateActivations();
    },
    clearAll(): void {
      for (const a of activations) {
        a.activation.cancelImmediate();
        a.onComplete();
      }
      activations = [];
    },
    step() {
      activations = activations.filter(({ activation, onComplete }) => {
        const didComplete = activation.step();
        if (didComplete) {
          onComplete();
        }
        return !didComplete;
      });
    },
  };
}

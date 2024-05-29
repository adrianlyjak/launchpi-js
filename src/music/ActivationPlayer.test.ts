import { ActivationPlayer } from "./ActivationPlayer";
import { Activation } from "./NoteActivation";

describe("ActivationPlayer", () => {
  it("should step", () => {
    const activation = TestActivation();
    const player = ActivationPlayer({});
    player.addActivation(activation);
    expect(activation.steps).toEqual(0);
    player.step();
    expect(activation.steps).toEqual(1);
  });

  it("should remove on complete", () => {
    const activation = TestActivation();
    const player = ActivationPlayer({});
    player.addActivation(activation);
    player.step();
    activation.isComplete = true;
    player.step();
    expect(activation.steps).toEqual(2);
    player.step();
    expect(activation.steps).toEqual(2);
  });
  it("should cancel", () => {
    const activation = TestActivation();
    const player = ActivationPlayer({});
    player.addActivation(activation);
    player.step();
    expect(activation.isCancelledImmediate).toEqual(false);
    player.clearAll();
    expect(activation.isCancelledImmediate).toEqual(true);
  });
});

interface TestActivation extends Activation {
  steps: number;
  isComplete: boolean;
  isCancelledImmediate: boolean;
  isCancelledLoop: boolean;
}

function TestActivation(): TestActivation {
  return {
    steps: 0,
    isComplete: false,
    isCancelledImmediate: false,
    isCancelledLoop: false,
    /** continue to play next note, and interrupt any notes that should be complete
     * @returns true if complete and this activation should be discarded */
    step(): boolean {
      this.steps++;
      return this.isComplete;
    },
    cancelImmediate(): void {
      this.isCancelledImmediate = true;
    },
    cancelLoop(): void {
      this.isCancelledLoop = true;
    },
  };
}

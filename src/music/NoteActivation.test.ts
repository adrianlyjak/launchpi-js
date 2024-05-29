import {
  chordActivation,
  chordSustainedActivation,
  intersperseActivation,
  mapSequence,
  OnOff,
  restActivation,
} from "./NoteActivation";

describe("NoteActivation", () => {
  it("should construct a chord", () => {
    expect(chordActivation([1, 2, 3], 2)).toEqual([
      [
        { note: 1, beats: 2 },
        { note: 2, beats: 2 },
        { note: 3, beats: 2 },
      ],
      [],
    ]);
  });
  it("should construct a sustained chord", () => {
    expect(chordSustainedActivation([1, 2])).toEqual([
      [{ note: 1 }, { note: 2 }],
    ]);
  });

  it("should construct a rest", () => {
    expect(restActivation(2)).toEqual([[], []]);
  });
  it("should intersperse varying lengths", () => {
    expect(
      intersperseActivation(chordActivation([1], 3), chordActivation([2], 2))
    ).toEqual([
      [
        { note: 1, beats: 3 },
        { note: 2, beats: 2 },
      ],
      [],
      [],
    ]);
  });

  it("should map a simple sequence", () => {
    const seq = chordActivation([1], 3);
    const result = mapSequence(seq);
    const expected: OnOff[][] = [
      [
        { note: 1, on: false },
        { note: 1, on: true },
      ],
      [],
      [],
    ];
    expect(result).toEqual(expected);
  });
});

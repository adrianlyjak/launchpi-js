import shiftArrayPointer from "./shiftArrayPointer";

describe("shiftArrayPointer", () => {
  it("should shift within array", () => {
    expect(shiftArrayPointer({ index: 5, delta: 1, size: 7 })).toEqual(6);
    expect(shiftArrayPointer({ index: 5, delta: -1, size: 7 })).toEqual(4);
  });
  it("should shift at arrays edges", () => {
    expect(shiftArrayPointer({ index: 6, delta: 1, size: 7 })).toEqual(0);
    expect(shiftArrayPointer({ index: 0, delta: 1, size: 7 })).toEqual(1);
    expect(shiftArrayPointer({ index: 0, delta: -1, size: 7 })).toEqual(6);
    expect(shiftArrayPointer({ index: 1, delta: -1, size: 7 })).toEqual(0);
  });
  it("should shift large jumps arrays edges", () => {
    expect(shiftArrayPointer({ index: 6, delta: 8, size: 7 })).toEqual(0);
    expect(shiftArrayPointer({ index: 0, delta: -8, size: 7 })).toEqual(6);
  });
});

import { createRainbow } from "./functions/colors";

describe("rainbow", () => {
  it("should make a simple rainbow with 6 steps", () => {
    const bow = createRainbow(6);
    expect(bow).toHaveLength(6);
    expect(bow[0]).toEqual([1, 0, 0]);
    expect(bow[1]).toEqual([1, 1, 0]);
    expect(bow[2]).toEqual([0, 1, 0]);
    expect(bow[3]).toEqual([0, 1, 1]);
    expect(bow[4]).toEqual([0, 0, 1]);
    expect(bow[5]).toEqual([1, 0, 1]);
  });
  it("should make a more complex rainbow with 12 steps", () => {
    const bow = createRainbow(12);
    expect(bow).toHaveLength(12);
    expect(bow[0]).toEqual([1, 0, 0]);
    expect(bow[1]).toEqual([1, 0.5, 0]);
    expect(bow[2]).toEqual([1, 1, 0]);
    expect(bow[3]).toEqual([0.5, 1, 0]);
    expect(bow[4]).toEqual([0, 1, 0]);
    expect(bow[5]).toEqual([0, 1, 0.5]);
    expect(bow[6]).toEqual([0, 1, 1]);
    expect(bow[7]).toEqual([0, 0.5, 1]);
    expect(bow[8]).toEqual([0, 0, 1]);
    expect(bow[9]).toEqual([0.5, 0, 1]);
    expect(bow[10]).toEqual([1, 0, 1]);
    expect(bow[11]).toEqual([1, 0, 0.5]);
  });
  it("should approximate a rainbow that's not divisibile by 12 steps", () => {
    const bow = createRainbow(9).map((rgb) =>
      rgb.map((x) => Number.parseFloat(x.toPrecision(1)))
    );
    expect(bow).toHaveLength(9);
    expect(bow[0]).toEqual([1, 0, 0]);
    expect(bow[1]).toEqual([1, 0.7, 0]);
    expect(bow[2]).toEqual([0.7, 1, 0]);
    expect(bow[3]).toEqual([0, 1, 0]);
    expect(bow[4]).toEqual([0, 1, 0.7]);
    expect(bow[5]).toEqual([0, 0.7, 1]);
    expect(bow[6]).toEqual([0, 0, 1]);
    expect(bow[7]).toEqual([0.7, 0, 1]);
    expect(bow[8]).toEqual([1, 0, 0.7]);
  });
});

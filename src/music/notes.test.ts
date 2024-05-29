import { familyOfNaturalMajor, rotateFamily } from "./notes";

describe("notes", () => {
  it("should rotateFamily by 1 to dorian", () => {
    expect(rotateFamily(familyOfNaturalMajor, 1)).toEqual([
      0, 2, 3, 5, 7, 9, 10,
    ]);
  });
  it("should rotateFamily by 6 to minor", () => {
    expect(rotateFamily(familyOfNaturalMajor, 6)).toEqual([
      0, 1, 3, 5, 6, 8, 10,
    ]);
  });
});

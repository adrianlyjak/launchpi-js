import { grid8x8, GridUtil } from "./GridUtil";

describe("GridUtils", () => {
  describe("withNeigborIndexes", () => {
    it("should return the correct neighbors for the lower 0 group", () => {
      expect(grid8x8.withNeighborIndexes(0, 2)).toEqual([0, 1, 8, 9]);
      expect(grid8x8.withNeighborIndexes(1, 2)).toEqual([0, 1, 8, 9]);
      expect(grid8x8.withNeighborIndexes(8, 2)).toEqual([0, 1, 8, 9]);
      expect(grid8x8.withNeighborIndexes(9, 2)).toEqual([0, 1, 8, 9]);
      expect(grid8x8.withNeighborIndexes(2, 2)).toEqual([2, 3, 10, 11]);
      expect(grid8x8.withNeighborIndexes(16, 2)).toEqual([16, 17, 24, 25]);
    });
  });

  describe("indexArray", () => {
    it("should return a natural list of numbers", () => {
      const arr = grid8x8.indexArray();
      expect(arr[0]).toEqual(0);
      expect(arr[63]).toEqual(63);
      expect(arr).toHaveLength(64);
    });
    it("should subdivide into minimum values in a 2x2", () => {
      expect(new GridUtil(4).indexArray(2)).toEqual([0, 2, 8, 10]);
    });
    it("should subdivide into values in an uneven 3x3", () => {
      expect(new GridUtil(8).indexArray(3)).toEqual([
        0, 3, 6, 24, 27, 30, 48, 51, 54,
      ]);
    });
  });

  describe("indexToPosition and positionToIndex", () => {
    it("should the corners correct", () => {
      expect(grid8x8.indexToPosition(0)).toEqual(11);
      expect(grid8x8.positionToIndex(11)).toEqual(0);
      expect(grid8x8.indexToPosition(63)).toEqual(88);
      expect(grid8x8.positionToIndex(88)).toEqual(63);
    });
    it("should map both ways", () => {
      for (const i of grid8x8.indexArray()) {
        expect(grid8x8.positionToIndex(grid8x8.indexToPosition(i))).toBe(i);
      }
    });
  });
});

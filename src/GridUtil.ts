export class GridUtil {
  dimensions: number;
  constructor(dimensions: number = 8) {
    this.dimensions = dimensions;
  }
  /**
   * mini mk3 in programmer mode sends notes that are row column indexed (starting at 1),
   * where the lower left corner is "11" and upper right is "88".
   * This function maps that number to an integer index in the range [0,64),
   * where 0 is the lower left, and 63 is the upper right */
  positionToIndex(note: number): number {
    const indices = note
      .toString()
      .split("")
      .map((x) => Number.parseInt(x) - 1);
    if (indices.length !== 2)
      throw new Error(
        `cannot map ${note}. Expected a 2 digit number, where each digit is between 1 and 8`
      );
    return indices[0] * this.dimensions + indices[1];
  }

  indexToPosition(index: number): number {
    const [row, col] = this.rowCol(index);
    return (row + 1) * 10 + (col + 1);
  }

  withNeighborIndexes(index: number, subdivisionSize: number): number[] {
    // find the 0-based coordinates of the index
    const [row, col] = this.rowCol(index);
    // find the lower corner of the subdivision
    const colOff = col % subdivisionSize;
    const rowOff = row % subdivisionSize;
    const colStart = col - colOff;
    const rowStart = row - rowOff;
    // enumerate all the values
    return Array(subdivisionSize)
      .fill(null)
      .flatMap((_, y) => {
        return Array(subdivisionSize)
          .fill(null)
          .map((_, x) => {
            return colStart + x + (rowStart + y) * this.dimensions;
          });
      });
  }

  indexArray(subdivisionSize: number = 1): number[] {
    const sections = Math.ceil(this.dimensions / subdivisionSize);
    return Array(sections * sections)
      .fill(undefined)
      .map((_, i) => {
        const [row, col] = new GridUtil(sections).rowCol(i);
        return row * this.dimensions * subdivisionSize + col * subdivisionSize;
      });
  }
  get empty(): undefined[] {
    return Array(this.dimensions * this.dimensions).fill(undefined);
  }

  rowCol(index: number): [number, number] {
    const row = Math.trunc(index / this.dimensions);
    const col = index % this.dimensions;
    return [row, col];
  }

  resize<T>(input: T[], fill: T, target: GridUtil): T[] {
    if (target.dimensions < this.dimensions) {
      throw new Error("cannot downsample");
    }
    return target.indexArray().map((i) => {
      const [row, col] = target.rowCol(i);
      if (col >= this.dimensions) {
        return fill;
      } else if (row >= this.dimensions) {
        return fill;
      } else {
        return input[row * this.dimensions + col]!;
      }
    });
  }

  indexInResizedGrid(index: number, target: GridUtil): number {
    if (target.dimensions < this.dimensions) {
      throw new Error("cannot downsample");
    }
    const [row, col] = this.rowCol(index);
    return row * target.dimensions + col;
  }
}

export const grid8x8 = new GridUtil(8);
export const grid9x9 = new GridUtil(9);

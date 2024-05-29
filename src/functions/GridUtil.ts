export interface GridUtilOptions {
  x: number;
  y: number;
}
export class GridUtil {
  dimensionsX: number;
  dimensionsY: number;

  static rect(props: GridUtilOptions): GridUtil {
    return new GridUtil(props);
  }

  static square(dims: number): GridUtil {
    return new GridUtil({ x: dims, y: dims });
  }

  constructor({ x, y }: GridUtilOptions) {
    this.dimensionsX = x;
    this.dimensionsY = y;
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
    return indices[0] * this.dimensionsX + indices[1];
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
            return colStart + x + (rowStart + y) * this.dimensionsX;
          });
      });
  }

  indexArray(subdivisionSize: number = 1): number[] {
    const sectionsX = Math.ceil(this.dimensionsX / subdivisionSize);
    const sectionsY = Math.ceil(this.dimensionsY / subdivisionSize);
    return Array(sectionsX * sectionsY)
      .fill(undefined)
      .map((_, i) => {
        const [row, col] = new GridUtil({ x: sectionsX, y: sectionsY }).rowCol(
          i
        );
        return row * this.dimensionsX * subdivisionSize + col * subdivisionSize;
      });
  }
  get empty(): undefined[] {
    return Array(this.dimensionsX * this.dimensionsY).fill(undefined);
  }

  rowCol(index: number): [number, number] {
    const row = Math.trunc(index / this.dimensionsX);
    const col = index % this.dimensionsX;
    return [row, col];
  }

  resize<T>(input: T[], fill: T, target: GridUtil): T[] {
    return target.indexArray().map((i) => {
      const [row, col] = target.rowCol(i);
      if (col >= this.dimensionsX) {
        return fill;
      } else if (row >= this.dimensionsY) {
        return fill;
      } else {
        return input[row * this.dimensionsX + col]!;
      }
    });
  }

  indexInResizedGrid(
    index: number,
    target: GridUtil,
    {
      offsetX = 0,
      offsetY = 0,
    }: {
      offsetX?: number;
      offsetY?: number;
    } = {}
  ): number {
    const [row, col] = this.rowCol(index);

    const targetX = col + offsetX;
    if (target.dimensionsX <= targetX) {
      throw new Error(
        `index x value of ${col}+${offsetX} is outside of target x dimensions ${target.dimensionsX}`
      );
    }

    const targetY = row + offsetY;
    if (target.dimensionsY <= targetY) {
      throw new Error(
        `index y value of ${row}+${offsetY} is outside of target y dimensions ${target.dimensionsY}`
      );
    }

    return targetY * target.dimensionsX + targetX;
  }
}

export const grid8x8 = new GridUtil({ x: 8, y: 8 });
export const grid9x9 = new GridUtil({ x: 9, y: 9 });

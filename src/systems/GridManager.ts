import { GridPosition } from '../types';

export class GridManager {
  private readonly tileSize: number = 32;
  private readonly gridWidth: number;
  private readonly gridHeight: number;

  constructor(gridWidth: number, gridHeight: number) {
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
  }

  gridToPixel(gridPos: GridPosition): { x: number; y: number } {
    return {
      x: gridPos.x * this.tileSize + this.tileSize / 2,
      y: gridPos.y * this.tileSize + this.tileSize / 2
    };
  }

  pixelToGrid(pixelX: number, pixelY: number): GridPosition {
    return {
      x: Math.floor(pixelX / this.tileSize),
      y: Math.floor(pixelY / this.tileSize)
    };
  }

  isValidPosition(pos: GridPosition): boolean {
    return pos.x >= 0 && pos.x < this.gridWidth &&
           pos.y >= 0 && pos.y < this.gridHeight;
  }

  getGridWidth(): number {
    return this.gridWidth;
  }

  getGridHeight(): number {
    return this.gridHeight;
  }
}

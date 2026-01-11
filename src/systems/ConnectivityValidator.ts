/**
 * ConnectivityValidator - Ensures all dungeon areas are reachable
 *
 * Purpose: Detects disconnected regions using flood fill and repairs them
 * by carving tunnels. Prevents impossible layouts where rooms/items/enemies
 * are isolated.
 */
export class ConnectivityValidator {
  /**
   * Validate if all floor tiles are connected
   * @param map - 2D array where 0 = floor, 1 = wall
   * @returns Object with connectivity status and region data
   */
  validateConnectivity(map: number[][]): { connected: boolean; regions: number[][] } {
    if (!map || map.length === 0) {
      return { connected: true, regions: [] };
    }

    const height = map.length;
    const width = map[0].length;
    const visited = new Set<number>();
    const regions: number[][] = [];

    // Find all disconnected regions using flood fill
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;

        // If floor tile and not yet visited, start new region
        if (map[y][x] === 0 && !visited.has(index)) {
          const region = this.floodFill(map, x, y, width, height, visited);
          regions.push(region);
        }
      }
    }

    return {
      connected: regions.length <= 1,
      regions: regions
    };
  }

  /**
   * Flood fill algorithm using queue-based BFS
   * @param map - Dungeon map
   * @param startX - Starting x coordinate
   * @param startY - Starting y coordinate
   * @param width - Map width
   * @param height - Map height
   * @param visited - Set of visited tile indices
   * @returns Array of tile indices in this region
   */
  private floodFill(
    map: number[][],
    startX: number,
    startY: number,
    width: number,
    height: number,
    visited: Set<number>
  ): number[] {
    const region: number[] = [];
    const queue: { x: number; y: number }[] = [{ x: startX, y: startY }];
    const startIndex = startY * width + startX;
    visited.add(startIndex);

    // 4-directional neighbors (no diagonals - matches game movement)
    const directions = [
      { dx: 0, dy: -1 },  // Up
      { dx: 1, dy: 0 },   // Right
      { dx: 0, dy: 1 },   // Down
      { dx: -1, dy: 0 }   // Left
    ];

    while (queue.length > 0) {
      const current = queue.shift()!;
      region.push(current.y * width + current.x);

      // Check all 4 neighbors
      for (const dir of directions) {
        const newX = current.x + dir.dx;
        const newY = current.y + dir.dy;
        const newIndex = newY * width + newX;

        // Bounds check
        if (newX < 0 || newX >= width || newY < 0 || newY >= height) {
          continue;
        }

        // Check if floor tile and not visited
        if (map[newY][newX] === 0 && !visited.has(newIndex)) {
          visited.add(newIndex);
          queue.push({ x: newX, y: newY });
        }
      }
    }

    return region;
  }
}

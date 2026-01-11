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

  /**
   * Connect two disconnected regions by carving a tunnel
   * @param map - Dungeon map to modify
   * @param region1 - Array of tile indices in first region
   * @param region2 - Array of tile indices in second region
   */
  connectRegions(map: number[][], region1: number[], region2: number[]): void {
    if (!map || map.length === 0 || region1.length === 0 || region2.length === 0) {
      return;
    }

    const width = map[0].length;

    // Find closest points between regions using Manhattan distance
    let minDistance = Infinity;
    let closestPoint1 = { x: 0, y: 0 };
    let closestPoint2 = { x: 0, y: 0 };

    for (const index1 of region1) {
      const x1 = index1 % width;
      const y1 = Math.floor(index1 / width);

      for (const index2 of region2) {
        const x2 = index2 % width;
        const y2 = Math.floor(index2 / width);

        const distance = Math.abs(x2 - x1) + Math.abs(y2 - y1);

        if (distance < minDistance) {
          minDistance = distance;
          closestPoint1 = { x: x1, y: y1 };
          closestPoint2 = { x: x2, y: y2 };
        }
      }
    }

    // Carve L-shaped tunnel between closest points
    this.carveTunnel(map, closestPoint1.x, closestPoint1.y, closestPoint2.x, closestPoint2.y);
  }

  /**
   * Carve L-shaped tunnel between two points
   * @param map - Dungeon map to modify
   * @param x1 - Start x coordinate
   * @param y1 - Start y coordinate
   * @param x2 - End x coordinate
   * @param y2 - End y coordinate
   */
  private carveTunnel(map: number[][], x1: number, y1: number, x2: number, y2: number): void {
    // Carve horizontal tunnel first (x1 to x2 at y1)
    const startX = Math.min(x1, x2);
    const endX = Math.max(x1, x2);
    for (let x = startX; x <= endX; x++) {
      if (y1 >= 0 && y1 < map.length && x >= 0 && x < map[0].length) {
        map[y1][x] = 0; // Set to floor
      }
    }

    // Carve vertical tunnel (y1 to y2 at x2)
    const startY = Math.min(y1, y2);
    const endY = Math.max(y1, y2);
    for (let y = startY; y <= endY; y++) {
      if (y >= 0 && y < map.length && x2 >= 0 && x2 < map[0].length) {
        map[y][x2] = 0; // Set to floor
      }
    }
  }

  /**
   * Validate connectivity and repair if disconnected
   * @param map - Dungeon map to validate and repair
   * @returns True if repairs were made, false if already connected
   */
  validateAndRepair(map: number[][]): boolean {
    const result = this.validateConnectivity(map);

    // Already connected - no repairs needed
    if (result.connected) {
      return false;
    }

    // Connect all regions to the first region (region 0)
    for (let i = 1; i < result.regions.length; i++) {
      this.connectRegions(map, result.regions[0], result.regions[i]);
    }

    return true; // Repairs were made
  }
}

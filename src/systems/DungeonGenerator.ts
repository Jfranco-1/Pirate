import ROT from 'rot-js';
import { RoomData, RoomType, RoomTheme } from '../types';

/**
 * DungeonGenerator - Wraps Rot.js Digger algorithm with room metadata extraction
 *
 * Purpose: Generates dungeon maps while tracking room data (bounds, type, theme, difficulty)
 * for intelligent entity spawning and special room placement.
 */
export class DungeonGenerator {
  /**
   * Generate a dungeon map with room metadata
   * @param width - Map width in tiles
   * @param height - Map height in tiles
   * @returns Object containing map array and room metadata
   */
  generate(width: number, height: number): { map: number[][], rooms: RoomData[] } {
    // Initialize map array
    const map: number[][] = [];

    // Create Rot.js Digger with default options (room+corridor style)
    const digger = new ROT.Map.Digger(width, height);

    // Build map via callback (0 = floor, 1 = wall)
    digger.create((x: number, y: number, value: number) => {
      if (!map[y]) {
        map[y] = [];
      }
      map[y][x] = value;
    });

    // Extract room data from Rot.js
    const rotRooms = digger.getRooms();

    // Convert ROT room objects to RoomData with metadata
    const rooms: RoomData[] = rotRooms.map((room, index) => {
      // Get room bounds
      const left = room.getLeft();
      const right = room.getRight();
      const top = room.getTop();
      const bottom = room.getBottom();

      // Calculate dimensions
      const roomWidth = right - left + 1;
      const roomHeight = bottom - top + 1;

      // Assign room type (first room = START, rest = NORMAL for now)
      // Boss/treasure/challenge assignment happens in plan 03-03
      const roomType = index === 0 ? RoomType.START : RoomType.NORMAL;

      // Assign random theme for visual variety
      const themes = [RoomTheme.DUNGEON, RoomTheme.CAVE, RoomTheme.CRYPT, RoomTheme.LIBRARY];
      const roomTheme = themes[Math.floor(Math.random() * themes.length)];

      // Calculate progressive difficulty (1-5 scale)
      // Earlier rooms easier, later rooms harder
      const difficulty = Math.min(5, Math.floor(index * 0.5) + 1);

      return {
        x: left,
        y: top,
        width: roomWidth,
        height: roomHeight,
        type: roomType,
        theme: roomTheme,
        difficulty: difficulty,
        connections: [] // Will be populated by connectivity validator in plan 03-02
      };
    });

    return { map, rooms };
  }
}

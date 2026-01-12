import ROT from 'rot-js';
import { RoomData, RoomType, RoomTheme } from '../types';
import { ConnectivityValidator } from './ConnectivityValidator';

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

    // Validate and repair connectivity
    const validator = new ConnectivityValidator();
    const result = validator.validateConnectivity(map);

    if (!result.connected) {
      const repaired = validator.validateAndRepair(map);
      if (repaired) {
        console.log(`Connected ${result.regions.length} disconnected regions`);
      }
    }

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

      // Room type will be assigned by assignRoomTypes() method
      const roomType = RoomType.NORMAL;

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

    // Assign room types using pathfinding distance
    this.assignRoomTypes(map, rooms, width);

    return { map, rooms };
  }

  /**
   * Assign special room types based on pathfinding distance and weighted randomness
   * @param map - Dungeon map for pathfinding
   * @param rooms - Room metadata array to update
   * @param width - Map width for coordinate calculations
   */
  private assignRoomTypes(map: number[][], rooms: RoomData[], width: number): void {
    if (rooms.length === 0) return;

    // Set first room as START
    rooms[0].type = RoomType.START;

    // Calculate pathfinding distance from start room to all other rooms
    const startRoom = rooms[0];
    const startX = Math.floor(startRoom.x + startRoom.width / 2);
    const startY = Math.floor(startRoom.y + startRoom.height / 2);

    let maxDistance = 0;
    let bossRoomIndex = -1;

    // Find room with maximum path distance from start
    for (let i = 1; i < rooms.length; i++) {
      const room = rooms[i];
      const roomCenterX = Math.floor(room.x + room.width / 2);
      const roomCenterY = Math.floor(room.y + room.height / 2);

      // Calculate path distance using ROT.Path.AStar
      const astar = new ROT.Path.AStar(roomCenterX, roomCenterY, (x, y) => {
        // Passable if within bounds and is floor tile
        if (y < 0 || y >= map.length || x < 0 || x >= map[0].length) {
          return false;
        }
        return map[y][x] === 0;
      });

      let pathLength = 0;
      astar.compute(startX, startY, (x, y) => {
        pathLength++;
      });

      if (pathLength > maxDistance) {
        maxDistance = pathLength;
        bossRoomIndex = i;
      }
    }

    // Assign BOSS to furthest room
    if (bossRoomIndex !== -1) {
      rooms[bossRoomIndex].type = RoomType.BOSS;
    }

    // Assign TREASURE and CHALLENGE rooms with weighted randomness
    for (let i = 1; i < rooms.length; i++) {
      // Skip if already assigned (START or BOSS)
      if (rooms[i].type !== RoomType.NORMAL) {
        continue;
      }

      const rand = Math.random();
      if (rand < 0.15) {
        // 15% chance for TREASURE
        rooms[i].type = RoomType.TREASURE;
      } else if (rand < 0.25) {
        // 10% chance for CHALLENGE (0.15 + 0.10 = 0.25)
        rooms[i].type = RoomType.CHALLENGE;
      }
      // Remaining rooms stay NORMAL
    }
  }
}

import ROT from 'rot-js';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { AIBehavior } from '../types';

/**
 * AISystem - Enemy decision-making using Rot.js pathfinding
 *
 * Implements three behavior patterns:
 * - AGGRESSIVE: Chase player using A* pathfinding
 * - RANGED: Maintain distance of 3-5 tiles, attack when in range
 * - DEFENSIVE: Only attack when adjacent, otherwise stay still
 */
export class AISystem {
  /**
   * Enemy makes a decision and executes action based on behavior
   */
  static selectAction(enemy: Enemy, player: Player, map: number[][]): void {
    switch (enemy.behavior) {
      case AIBehavior.AGGRESSIVE:
        this.aggressiveBehavior(enemy, player, map);
        break;

      case AIBehavior.RANGED:
        this.rangedBehavior(enemy, player, map);
        break;

      case AIBehavior.DEFENSIVE:
        this.defensiveBehavior(enemy, player);
        break;
    }
  }

  /**
   * AGGRESSIVE: Chase player, attack when adjacent
   */
  private static aggressiveBehavior(enemy: Enemy, player: Player, map: number[][]): void {
    const distance = this.manhattanDistance(enemy, player);

    // If adjacent, attack
    if (distance === 1) {
      enemy.attack(player);
      return;
    }

    // Otherwise, move toward player
    const path = this.findPathToTarget(enemy, player, map);
    if (path && path.length > 1) {
      // Move to next step in path (path[0] is current position)
      enemy.moveTo(path[1][0], path[1][1]);
    }
  }

  /**
   * RANGED: Maintain distance of 3-5 tiles, attack in range
   */
  private static rangedBehavior(enemy: Enemy, player: Player, map: number[][]): void {
    const distance = this.manhattanDistance(enemy, player);

    // Too close - move away
    if (distance < 3) {
      this.moveAwayFrom(enemy, player, map);
      return;
    }

    // Too far - move closer
    if (distance > 5) {
      const path = this.findPathToTarget(enemy, player, map);
      if (path && path.length > 1) {
        enemy.moveTo(path[1][0], path[1][1]);
      }
      return;
    }

    // Good range (3-5 tiles) - attack
    enemy.attack(player);
  }

  /**
   * DEFENSIVE: Only attack when adjacent, otherwise stay still
   */
  private static defensiveBehavior(enemy: Enemy, player: Player): void {
    const distance = this.manhattanDistance(enemy, player);

    // Only attack if adjacent
    if (distance === 1) {
      enemy.attack(player);
    }
    // Otherwise do nothing (stay still)
  }

  /**
   * Find path from enemy to player using Rot.js A*
   */
  private static findPathToTarget(
    enemy: Enemy,
    player: Player,
    map: number[][]
  ): [number, number][] | null {
    const path: [number, number][] = [];

    // Create A* pathfinder targeting player position
    const astar = new ROT.Path.AStar(
      player.gridX,
      player.gridY,
      (x, y) => {
        // Check bounds
        if (y < 0 || y >= map.length || x < 0 || x >= map[y].length) {
          return false;
        }
        // Walkable if floor (0)
        return map[y][x] === 0;
      },
      { topology: 4 } // 4-way movement (no diagonals)
    );

    // Compute path from enemy position
    astar.compute(enemy.gridX, enemy.gridY, (x, y) => {
      path.push([x, y]);
    });

    return path.length > 0 ? path : null;
  }

  /**
   * Move enemy away from player (for ranged behavior)
   */
  private static moveAwayFrom(enemy: Enemy, player: Player, map: number[][]): void {
    const dx = enemy.gridX - player.gridX;
    const dy = enemy.gridY - player.gridY;

    // Normalize direction (move away)
    const moveX = dx === 0 ? 0 : dx > 0 ? 1 : -1;
    const moveY = dy === 0 ? 0 : dy > 0 ? 1 : -1;

    // Try to move away on both axes
    const newX = enemy.gridX + moveX;
    const newY = enemy.gridY + moveY;

    // Validate move
    if (this.isWalkable(newX, newY, map)) {
      enemy.moveTo(newX, newY);
      return;
    }

    // If diagonal blocked, try moving on just X axis
    if (moveX !== 0 && this.isWalkable(enemy.gridX + moveX, enemy.gridY, map)) {
      enemy.moveTo(enemy.gridX + moveX, enemy.gridY);
      return;
    }

    // Try just Y axis
    if (moveY !== 0 && this.isWalkable(enemy.gridX, enemy.gridY + moveY, map)) {
      enemy.moveTo(enemy.gridX, enemy.gridY + moveY);
    }

    // If all blocked, stay still
  }

  /**
   * Calculate Manhattan distance between two entities
   */
  private static manhattanDistance(a: { gridX: number; gridY: number }, b: { gridX: number; gridY: number }): number {
    return Math.abs(a.gridX - b.gridX) + Math.abs(a.gridY - b.gridY);
  }

  /**
   * Check if a position is walkable
   */
  private static isWalkable(x: number, y: number, map: number[][]): boolean {
    if (y < 0 || y >= map.length || x < 0 || x >= map[y].length) {
      return false;
    }
    return map[y][x] === 0;
  }
}

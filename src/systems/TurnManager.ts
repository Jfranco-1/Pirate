import { TurnState } from '../types';
import { Enemy } from '../entities/Enemy';
import { Player } from '../entities/Player';
import { GridManager } from './GridManager';

/**
 * TurnManager - Simple FSM for turn-based combat flow
 *
 * Manages turn state between PLAYER_TURN and ENEMY_TURN.
 * Flow: Player acts → enemies act → back to player.
 * No complex action queues or priority systems.
 */
export class TurnManager {
  private state: TurnState = TurnState.PLAYER_TURN;
  private enemies: Enemy[] = [];
  public onTurnChange: ((isPlayerTurn: boolean) => void) | null = null;

  addEnemy(enemy: Enemy): void {
    this.enemies.push(enemy);
  }

  removeEnemy(enemy: Enemy): void {
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      this.enemies.splice(index, 1);
    }
  }

  isPlayerTurn(): boolean {
    return this.state === TurnState.PLAYER_TURN;
  }

  endPlayerTurn(player: Player, map: number[][], gridManager: GridManager): void {
    // Tick player status effects before ending turn
    if (player.isAlive()) {
      const { damage, healing } = player.statusManager.tick();
      player.updateStatusIcons();
      // Damage/healing is applied directly by StatusEffectManager
      // GameScene will handle visual feedback via callbacks
    }

    // Switch to enemy turn
    this.state = TurnState.ENEMY_TURN;
    if (this.onTurnChange) {
      this.onTurnChange(false); // Not player turn
    }

    // Tick all enemy status effects at start of enemy turn
    for (const enemy of this.enemies) {
      if (enemy.isAlive()) {
        const { damage, healing } = enemy.statusManager.tick();
        enemy.updateStatusIcons();
        // Damage/healing is applied directly by StatusEffectManager
        // GameScene will handle visual feedback via callbacks
      }
    }

    // Process all living enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      if (enemy.isAlive()) {
        enemy.selectAction(player, map, gridManager);
      } else {
        // Remove dead enemies from tracking
        this.enemies.splice(i, 1);
      }
    }

    // Switch back to player turn
    this.state = TurnState.PLAYER_TURN;
    if (this.onTurnChange) {
      this.onTurnChange(true); // Player turn
    }
  }

  getCurrentState(): TurnState {
    return this.state;
  }
}

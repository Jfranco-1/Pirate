import Phaser from 'phaser';
import { CharacterClass, ItemType, MetaUpgradeId } from '../types';
import { MetaProgressionManager } from '../systems/MetaProgressionManager';

/**
 * MetaProgressionUI
 *
 * Lightweight debug UI panel to view/spend meta currency and manage unlocks.
 * Intended to validate the meta-progression loop during development.
 */
export class MetaProgressionUI {
  private scene: Phaser.Scene;
  private meta: MetaProgressionManager;

  private panel: Phaser.GameObjects.Graphics;
  private text: Phaser.GameObjects.Text;
  private visible = true;

  constructor(scene: Phaser.Scene, x: number, y: number, meta: MetaProgressionManager) {
    this.scene = scene;
    this.meta = meta;

    this.panel = scene.add.graphics();
    this.panel.setDepth(600);
    this.panel.fillStyle(0x000000, 0.7);
    this.panel.fillRect(x, y, 260, 140);
    this.panel.lineStyle(2, 0xffffff);
    this.panel.strokeRect(x, y, 260, 140);

    this.text = scene.add.text(x + 10, y + 10, '', {
      fontSize: '12px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.text.setDepth(601);

    this.refresh();
  }

  toggle(): void {
    this.visible = !this.visible;
    this.panel.setVisible(this.visible);
    this.text.setVisible(this.visible);
  }

  refresh(): void {
    const cls = this.meta.getSelectedClass();
    const currency = this.meta.getCurrency();

    const hp = this.lineUpgrade('MAX_HP');
    const atk = this.lineUpgrade('ATTACK');
    const def = this.lineUpgrade('DEFENSE');

    const fireUnlocked = this.meta.isItemUnlocked(ItemType.FIRE_BOMB);
    const rogueUnlocked = this.meta.isClassUnlocked(CharacterClass.ROGUE);
    const guardianUnlocked = this.meta.isClassUnlocked(CharacterClass.GUARDIAN);

    const lifetime = this.meta.getLifetime();

    this.text.setText(
      `META\n` +
      `Currency: ${currency}\n` +
      `Class: ${this.meta.getClassName(cls)}\n` +
      `${hp}\n` +
      `${atk}\n` +
      `${def}\n` +
      `Unlock Fire Bomb: ${fireUnlocked ? 'YES' : 'NO (U=25)'}\n` +
      `Unlock Rogue: ${rogueUnlocked ? 'YES' : 'NO (O=50)'}\n` +
      `Unlock Guardian: ${guardianUnlocked ? 'YES' : 'NO (P=50)'}\n` +
      `Runs: ${lifetime.runsStarted}/${lifetime.runsEnded}  Kills: ${lifetime.enemiesKilled}\n` +
      `Keys: M toggle | H/J/K buy | Z/X class | U/O/P unlock | L reset save`
    );
  }

  private lineUpgrade(id: MetaUpgradeId): string {
    const lvl = this.meta.getUpgradeLevel(id);
    const cost = this.meta.getUpgradeCost(id);
    const label = id === 'MAX_HP' ? 'MaxHP' : id === 'ATTACK' ? 'ATK' : 'DEF';
    const key = id === 'MAX_HP' ? 'H' : id === 'ATTACK' ? 'J' : 'K';
    return `${label}: Lv${lvl} (${key} cost ${cost})`;
  }
}


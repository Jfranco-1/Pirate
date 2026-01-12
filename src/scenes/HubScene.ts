import Phaser from 'phaser';
import { CharacterClass, ItemType, MetaUpgradeId } from '../types';
import { MetaProgressionManager } from '../systems/MetaProgressionManager';

/**
 * HubScene - Pre-run menu for meta-progression
 * 
 * Displays class selection, upgrade shop, unlock shop, and lifetime stats.
 * Players interact with meta-progression here before starting each run.
 */
export class HubScene extends Phaser.Scene {
  private meta!: MetaProgressionManager;
  private currencyText!: Phaser.GameObjects.Text;
  private classBoxes: Map<CharacterClass, Phaser.GameObjects.Container> = new Map();
  private upgradeTexts: Map<MetaUpgradeId, { levelText: Phaser.GameObjects.Text; costText: Phaser.GameObjects.Text; button: Phaser.GameObjects.Text }> = new Map();
  private unlockElements: Map<string, { statusText: Phaser.GameObjects.Text; button: Phaser.GameObjects.Text | null }> = new Map();
  private statsText!: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'HubScene' });
  }

  create(): void {
    this.meta = MetaProgressionManager.getInstance();

    // Dark background
    const bg = this.add.graphics();
    bg.fillStyle(0x111111, 1);
    bg.fillRect(0, 0, 800, 600);

    // Title
    this.add.text(400, 30, 'METRIC', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(400, 70, 'Tactical Dungeon Crawler', {
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5);

    // Currency display (top-right)
    this.add.text(700, 20, 'Currency:', {
      fontSize: '16px',
      color: '#ffcc00'
    }).setOrigin(1, 0);

    this.currencyText = this.add.text(780, 20, '0', {
      fontSize: '24px',
      color: '#ffcc00',
      fontStyle: 'bold'
    }).setOrigin(1, 0);

    // Create panels
    this.createClassSelection();
    this.createUpgradeShop();
    this.createUnlockShop();
    this.createLifetimeStats();
    this.createStartButton();
    this.createControlsHelp();
    this.createResetButton();

    // Initial refresh
    this.refreshDisplay();
  }

  /**
   * Create class selection panel (left side)
   */
  private createClassSelection(): void {
    // Section header
    this.add.text(150, 110, 'SELECT CLASS', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const classes = [
      { cls: CharacterClass.WARRIOR, name: 'Warrior', color: 0x00ff00, stats: { hp: 20, atk: 5, def: 2 } },
      { cls: CharacterClass.ROGUE, name: 'Rogue', color: 0xffff00, stats: { hp: 16, atk: 7, def: 1 } },
      { cls: CharacterClass.GUARDIAN, name: 'Guardian', color: 0x0088ff, stats: { hp: 24, atk: 4, def: 4 } }
    ];

    classes.forEach((classData, index) => {
      const y = 160 + index * 100;
      this.createClassBox(classData.cls, classData.name, classData.color, classData.stats, 150, y);
    });
  }

  /**
   * Create a clickable class selection box
   */
  private createClassBox(
    cls: CharacterClass,
    name: string,
    color: number,
    stats: { hp: number; atk: number; def: number },
    x: number,
    y: number
  ): void {
    const container = this.add.container(x, y);

    // Background box
    const box = this.add.graphics();
    box.fillStyle(0x222222, 1);
    box.fillRoundedRect(-70, -35, 140, 70, 8);
    box.lineStyle(2, 0x444444);
    box.strokeRoundedRect(-70, -35, 140, 70, 8);
    container.add(box);

    // Color indicator
    const colorBox = this.add.graphics();
    colorBox.fillStyle(color, 1);
    colorBox.fillRect(-55, -20, 20, 20);
    container.add(colorBox);

    // Class name
    const nameText = this.add.text(-30, -18, name, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    container.add(nameText);

    // Stats
    const statsText = this.add.text(-55, 5, `HP:${stats.hp} ATK:${stats.atk} DEF:${stats.def}`, {
      fontSize: '12px',
      color: '#aaaaaa'
    });
    container.add(statsText);

    // Selection border (hidden by default)
    const selectionBorder = this.add.graphics();
    selectionBorder.lineStyle(3, 0xffcc00);
    selectionBorder.strokeRoundedRect(-70, -35, 140, 70, 8);
    selectionBorder.setVisible(false);
    container.add(selectionBorder);

    // Lock overlay (for locked classes)
    const lockOverlay = this.add.graphics();
    lockOverlay.fillStyle(0x000000, 0.7);
    lockOverlay.fillRoundedRect(-70, -35, 140, 70, 8);
    container.add(lockOverlay);

    const lockText = this.add.text(0, 0, '🔒 LOCKED', {
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5);
    container.add(lockText);

    // Store references for updates
    this.classBoxes.set(cls, container);
    container.setData('box', box);
    container.setData('selectionBorder', selectionBorder);
    container.setData('lockOverlay', lockOverlay);
    container.setData('lockText', lockText);
    container.setData('class', cls);

    // Make interactive
    const hitArea = new Phaser.Geom.Rectangle(-70, -35, 140, 70);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    container.on('pointerover', () => {
      if (this.meta.isClassUnlocked(cls)) {
        box.clear();
        box.fillStyle(0x333333, 1);
        box.fillRoundedRect(-70, -35, 140, 70, 8);
        box.lineStyle(2, 0x666666);
        box.strokeRoundedRect(-70, -35, 140, 70, 8);
      }
    });

    container.on('pointerout', () => {
      box.clear();
      box.fillStyle(0x222222, 1);
      box.fillRoundedRect(-70, -35, 140, 70, 8);
      box.lineStyle(2, 0x444444);
      box.strokeRoundedRect(-70, -35, 140, 70, 8);
    });

    container.on('pointerdown', () => {
      if (this.meta.isClassUnlocked(cls)) {
        this.meta.setSelectedClass(cls);
        this.refreshDisplay();
      }
    });
  }

  /**
   * Create upgrade shop panel (center-right)
   */
  private createUpgradeShop(): void {
    // Section header
    this.add.text(500, 110, 'UPGRADES', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const upgrades: { id: MetaUpgradeId; name: string; effect: string }[] = [
      { id: 'MAX_HP', name: 'Max Health', effect: '+2 HP per level' },
      { id: 'ATTACK', name: 'Attack', effect: '+1 ATK per level' },
      { id: 'DEFENSE', name: 'Defense', effect: '+1 DEF per level' }
    ];

    upgrades.forEach((upgrade, index) => {
      const y = 150 + index * 60;
      this.createUpgradeRow(upgrade.id, upgrade.name, upgrade.effect, 400, y);
    });
  }

  /**
   * Create an upgrade purchase row
   */
  private createUpgradeRow(id: MetaUpgradeId, name: string, effect: string, x: number, y: number): void {
    // Name and effect
    this.add.text(x, y, name, {
      fontSize: '16px',
      color: '#ffffff'
    });

    this.add.text(x, y + 18, effect, {
      fontSize: '12px',
      color: '#888888'
    });

    // Level display
    const levelText = this.add.text(x + 140, y, 'Lv 0', {
      fontSize: '16px',
      color: '#00ff00'
    });

    // Cost display
    const costText = this.add.text(x + 200, y, 'Cost: 10', {
      fontSize: '14px',
      color: '#ffcc00'
    });

    // Buy button
    const buyButton = this.add.text(x + 290, y, '[BUY]', {
      fontSize: '16px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setInteractive({ useHandCursor: true });

    buyButton.on('pointerover', () => {
      buyButton.setColor('#88ff88');
    });

    buyButton.on('pointerout', () => {
      const cost = this.meta.getUpgradeCost(id);
      if (this.meta.getCurrency() >= cost) {
        buyButton.setColor('#00ff00');
      } else {
        buyButton.setColor('#666666');
      }
    });

    buyButton.on('pointerdown', () => {
      if (this.meta.purchaseUpgrade(id)) {
        this.refreshDisplay();
      }
    });

    this.upgradeTexts.set(id, { levelText, costText, button: buyButton });
  }

  /**
   * Create unlock shop panel (bottom area)
   */
  private createUnlockShop(): void {
    // Section header
    this.add.text(400, 340, 'UNLOCKS', {
      fontSize: '20px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Fire Bomb unlock
    this.createUnlockRow('fire_bomb', 'Fire Bomb', 25, 150, 380);

    // Rogue class unlock
    this.createUnlockRow('rogue', 'Rogue Class', 50, 400, 380);

    // Guardian class unlock
    this.createUnlockRow('guardian', 'Guardian Class', 50, 650, 380);
  }

  /**
   * Create an unlock purchase row
   */
  private createUnlockRow(key: string, name: string, cost: number, x: number, y: number): void {
    // Name
    this.add.text(x, y, name, {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Status text (UNLOCKED or cost)
    const statusText = this.add.text(x, y + 20, `Cost: ${cost}`, {
      fontSize: '12px',
      color: '#ffcc00'
    }).setOrigin(0.5);

    // Unlock button
    const unlockButton = this.add.text(x, y + 40, '[UNLOCK]', {
      fontSize: '14px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    unlockButton.on('pointerover', () => {
      unlockButton.setColor('#88ff88');
    });

    unlockButton.on('pointerout', () => {
      this.updateUnlockButton(key);
    });

    unlockButton.on('pointerdown', () => {
      this.purchaseUnlock(key, cost);
    });

    this.unlockElements.set(key, { statusText, button: unlockButton });
  }

  /**
   * Purchase an unlock
   */
  private purchaseUnlock(key: string, cost: number): void {
    let success = false;

    switch (key) {
      case 'fire_bomb':
        success = this.meta.unlockItem(ItemType.FIRE_BOMB, cost);
        break;
      case 'rogue':
        success = this.meta.unlockClass(CharacterClass.ROGUE, cost);
        break;
      case 'guardian':
        success = this.meta.unlockClass(CharacterClass.GUARDIAN, cost);
        break;
    }

    if (success) {
      this.refreshDisplay();
    }
  }

  /**
   * Update unlock button appearance
   */
  private updateUnlockButton(key: string): void {
    const element = this.unlockElements.get(key);
    if (!element) return;

    let isUnlocked = false;
    let cost = 0;

    switch (key) {
      case 'fire_bomb':
        isUnlocked = this.meta.isItemUnlocked(ItemType.FIRE_BOMB);
        cost = 25;
        break;
      case 'rogue':
        isUnlocked = this.meta.isClassUnlocked(CharacterClass.ROGUE);
        cost = 50;
        break;
      case 'guardian':
        isUnlocked = this.meta.isClassUnlocked(CharacterClass.GUARDIAN);
        cost = 50;
        break;
    }

    if (isUnlocked) {
      element.statusText.setText('✓ UNLOCKED');
      element.statusText.setColor('#00ff00');
      if (element.button) {
        element.button.setVisible(false);
      }
    } else {
      element.statusText.setText(`Cost: ${cost}`);
      element.statusText.setColor('#ffcc00');
      if (element.button) {
        element.button.setVisible(true);
        if (this.meta.getCurrency() >= cost) {
          element.button.setColor('#00ff00');
        } else {
          element.button.setColor('#666666');
        }
      }
    }
  }

  /**
   * Create lifetime stats display
   */
  private createLifetimeStats(): void {
    this.statsText = this.add.text(400, 480, '', {
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5);
  }

  /**
   * Create start run button
   */
  private createStartButton(): void {
    const button = this.add.text(400, 530, '[ START RUN ]', {
      fontSize: '28px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      button.setColor('#88ff88');
      button.setScale(1.1);
    });

    button.on('pointerout', () => {
      button.setColor('#00ff00');
      button.setScale(1.0);
    });

    button.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }

  /**
   * Create controls help text
   */
  private createControlsHelp(): void {
    this.add.text(400, 575, 'Controls: WASD/Arrows to move • 1-5 use items • R return to hub', {
      fontSize: '12px',
      color: '#666666'
    }).setOrigin(0.5);
  }

  /**
   * Create reset save button
   */
  private createResetButton(): void {
    const resetButton = this.add.text(70, 575, '[Reset Progress]', {
      fontSize: '12px',
      color: '#ff4444'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    let confirmPending = false;

    resetButton.on('pointerover', () => {
      resetButton.setColor('#ff8888');
    });

    resetButton.on('pointerout', () => {
      resetButton.setColor('#ff4444');
      confirmPending = false;
      resetButton.setText('[Reset Progress]');
    });

    resetButton.on('pointerdown', () => {
      if (confirmPending) {
        // Second click - confirm reset
        this.meta.resetSave();
        this.refreshDisplay();
        confirmPending = false;
        resetButton.setText('[Reset Progress]');
      } else {
        // First click - ask for confirmation
        confirmPending = true;
        resetButton.setText('[Click again to confirm]');
      }
    });
  }

  /**
   * Refresh all displays
   */
  private refreshDisplay(): void {
    // Update currency
    this.currencyText.setText(this.meta.getCurrency().toString());

    // Update class selection
    this.refreshClassSelection();

    // Update upgrades
    this.refreshUpgrades();

    // Update unlocks
    this.refreshUnlocks();

    // Update stats
    this.refreshStats();
  }

  /**
   * Refresh class selection visuals
   */
  private refreshClassSelection(): void {
    const selectedClass = this.meta.getSelectedClass();

    for (const [cls, container] of this.classBoxes) {
      const isUnlocked = this.meta.isClassUnlocked(cls);
      const isSelected = cls === selectedClass;

      const selectionBorder = container.getData('selectionBorder') as Phaser.GameObjects.Graphics;
      const lockOverlay = container.getData('lockOverlay') as Phaser.GameObjects.Graphics;
      const lockText = container.getData('lockText') as Phaser.GameObjects.Text;

      selectionBorder.setVisible(isSelected && isUnlocked);
      lockOverlay.setVisible(!isUnlocked);
      lockText.setVisible(!isUnlocked);
    }
  }

  /**
   * Refresh upgrade displays
   */
  private refreshUpgrades(): void {
    const currency = this.meta.getCurrency();

    for (const [id, elements] of this.upgradeTexts) {
      const level = this.meta.getUpgradeLevel(id);
      const cost = this.meta.getUpgradeCost(id);
      const canAfford = currency >= cost;

      elements.levelText.setText(`Lv ${level}`);
      elements.costText.setText(`Cost: ${cost}`);
      elements.button.setColor(canAfford ? '#00ff00' : '#666666');
    }
  }

  /**
   * Refresh unlock displays
   */
  private refreshUnlocks(): void {
    for (const key of this.unlockElements.keys()) {
      this.updateUnlockButton(key);
    }
  }

  /**
   * Refresh lifetime stats
   */
  private refreshStats(): void {
    const lifetime = this.meta.getLifetime();
    this.statsText.setText(
      `Runs: ${lifetime.runsStarted} | ` +
      `Completed: ${lifetime.runsEnded} | ` +
      `Kills: ${lifetime.enemiesKilled} | ` +
      `Total Earned: ${lifetime.currencyEarned}`
    );
  }
}

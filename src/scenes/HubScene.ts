import Phaser from 'phaser';
import { CharacterClass, ItemType, MetaUpgradeId, PirateClass } from '../types';
import { MetaProgressionManager } from '../systems/MetaProgressionManager';
import { PIRATE_CLASSES } from '../systems/PirateClassSystem';

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

    // Dark ocean-themed background
    const bg = this.add.graphics();
    bg.fillStyle(0x0a1520, 1);
    bg.fillRect(0, 0, 800, 600);
    
    // Wave pattern at bottom
    bg.fillStyle(0x0d1a28, 1);
    for (let x = 0; x < 800; x += 40) {
      bg.fillRect(x, 560, 35, 40);
    }
    bg.fillStyle(0x102030, 1);
    for (let x = 20; x < 800; x += 40) {
      bg.fillRect(x, 570, 35, 30);
    }

    // Title with pirate theme
    this.add.text(400, 25, '⚓ SEEKERS OF THE', {
      fontSize: '20px',
      color: '#668899',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    this.add.text(400, 55, 'DROWNED SEAL', {
      fontSize: '42px',
      color: '#88ccff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(400, 95, 'Break the curse before the Blood Moon rises', {
      fontSize: '14px',
      color: '#556677'
    }).setOrigin(0.5);

    // Currency display (top-right) - Doubloons!
    this.add.text(700, 20, '🪙 Doubloons:', {
      fontSize: '14px',
      color: '#ddaa44'
    }).setOrigin(1, 0);

    this.currencyText = this.add.text(780, 20, '0', {
      fontSize: '22px',
      color: '#ffcc44',
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
    this.add.text(150, 115, '⚔️ CHOOSE YOUR PATH', {
      fontSize: '16px',
      color: '#aabbcc',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Map old classes to pirate theme with enhanced info
    const classes = [
      { 
        cls: CharacterClass.WARRIOR, 
        name: 'Duelist', 
        title: 'Blade of the Storm',
        color: 0xff4444, 
        stats: { hp: 18, atk: 7, def: 1 },
        insight: '+0'
      },
      { 
        cls: CharacterClass.ROGUE, 
        name: 'Navigator', 
        title: 'Reader of Winds',
        color: 0x00aaff, 
        stats: { hp: 16, atk: 4, def: 2 },
        insight: '+10'
      },
      { 
        cls: CharacterClass.GUARDIAN, 
        name: 'Quartermaster', 
        title: 'Voice of the Crew',
        color: 0xffaa00, 
        stats: { hp: 20, atk: 4, def: 3 },
        insight: '+0'
      }
    ];

    classes.forEach((classData, index) => {
      const y = 170 + index * 100;
      this.createClassBox(classData.cls, classData.name, classData.color, classData.stats, 150, y, classData.title, classData.insight);
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
    y: number,
    title?: string,
    insight?: string
  ): void {
    const container = this.add.container(x, y);

    // Background box with gradient effect
    const box = this.add.graphics();
    box.fillStyle(0x1a2030, 1);
    box.fillRoundedRect(-75, -40, 150, 80, 8);
    box.lineStyle(2, 0x334455);
    box.strokeRoundedRect(-75, -40, 150, 80, 8);
    container.add(box);

    // Color indicator (pirate emblem style)
    const colorBox = this.add.graphics();
    colorBox.fillStyle(color, 1);
    colorBox.fillCircle(-50, -15, 12);
    colorBox.lineStyle(2, 0xffffff, 0.3);
    colorBox.strokeCircle(-50, -15, 12);
    container.add(colorBox);

    // Class name
    const nameText = this.add.text(-30, -25, name, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    container.add(nameText);
    
    // Title (subtitle)
    if (title) {
      const titleText = this.add.text(-30, -8, title, {
        fontSize: '9px',
        color: '#778899'
      });
      container.add(titleText);
    }

    // Stats
    const statsText = this.add.text(-60, 10, `HP:${stats.hp} ATK:${stats.atk} DEF:${stats.def}`, {
      fontSize: '11px',
      color: '#88aacc'
    });
    container.add(statsText);
    
    // Insight bonus
    if (insight) {
      const insightText = this.add.text(-60, 25, `Insight: ${insight}`, {
        fontSize: '10px',
        color: '#44aaff'
      });
      container.add(insightText);
    }

    // Selection border (hidden by default)
    const selectionBorder = this.add.graphics();
    selectionBorder.lineStyle(3, 0x44ffaa);
    selectionBorder.strokeRoundedRect(-75, -40, 150, 80, 8);
    selectionBorder.setVisible(false);
    container.add(selectionBorder);

    // Lock overlay (for locked classes)
    const lockOverlay = this.add.graphics();
    lockOverlay.fillStyle(0x000000, 0.8);
    lockOverlay.fillRoundedRect(-75, -40, 150, 80, 8);
    container.add(lockOverlay);

    const lockText = this.add.text(0, 0, '🔒 LOCKED', {
      fontSize: '14px',
      color: '#556677'
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
    const hitArea = new Phaser.Geom.Rectangle(-75, -40, 150, 80);
    container.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    container.on('pointerover', () => {
      if (this.meta.isClassUnlocked(cls)) {
        box.clear();
        box.fillStyle(0x253040, 1);
        box.fillRoundedRect(-75, -40, 150, 80, 8);
        box.lineStyle(2, 0x556677);
        box.strokeRoundedRect(-75, -40, 150, 80, 8);
      }
    });

    container.on('pointerout', () => {
      box.clear();
      box.fillStyle(0x1a2030, 1);
      box.fillRoundedRect(-75, -40, 150, 80, 8);
      box.lineStyle(2, 0x334455);
      box.strokeRoundedRect(-75, -40, 150, 80, 8);
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
    this.add.text(500, 115, '🛠️ SHIP UPGRADES', {
      fontSize: '16px',
      color: '#aabbcc',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const upgrades: { id: MetaUpgradeId; name: string; effect: string }[] = [
      { id: 'MAX_HP', name: 'Hull Integrity', effect: '+2 HP per level' },
      { id: 'ATTACK', name: 'Blade Sharpening', effect: '+1 ATK per level' },
      { id: 'DEFENSE', name: 'Armor Plating', effect: '+1 DEF per level' }
    ];

    upgrades.forEach((upgrade, index) => {
      const y = 160 + index * 60;
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
    this.add.text(400, 345, '🗝️ UNLOCKABLES', {
      fontSize: '16px',
      color: '#aabbcc',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Fire Bomb unlock
    this.createUnlockRow('fire_bomb', 'Greek Fire', 25, 150, 390);

    // Navigator class unlock (was Rogue)
    this.createUnlockRow('rogue', 'Navigator Path', 50, 400, 390);

    // Quartermaster class unlock (was Guardian)
    this.createUnlockRow('guardian', 'Quartermaster Path', 50, 650, 390);
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
    const button = this.add.text(400, 510, '⚓ SET SAIL ⚓', {
      fontSize: '28px',
      color: '#44ddff',
      fontStyle: 'bold'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    button.on('pointerover', () => {
      button.setColor('#88ffff');
      button.setScale(1.1);
    });

    button.on('pointerout', () => {
      button.setColor('#44ddff');
      button.setScale(1.0);
    });

    button.on('pointerdown', () => {
      this.scene.start('WorldMapScene');
    });
  }

  /**
   * Create controls help text
   */
  private createControlsHelp(): void {
    this.add.text(400, 545, 'Controls: WASD/Arrows to move • 1-5 use items • R return to port', {
      fontSize: '11px',
      color: '#445566'
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
      `Voyages: ${lifetime.runsStarted} | ` +
      `Survived: ${lifetime.runsEnded} | ` +
      `Foes Vanquished: ${lifetime.enemiesKilled} | ` +
      `Total Plunder: ${lifetime.currencyEarned}`
    );
    this.statsText.setColor('#556677');
  }
}

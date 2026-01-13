import Phaser from 'phaser';
import { MetaProgressionManager } from '../systems/MetaProgressionManager';
import { SessionStateManager } from '../systems/SessionStateManager';

/**
 * Location types on the world map
 */
export enum LocationType {
  PORT = 'port',           // Safe haven - trade, rest, info
  ISLAND = 'island',       // Explorable - caves, ruins
  SHIP = 'ship',           // Enemy vessel - combat dungeon
  MONASTERY = 'monastery', // Special - lore, binding words
  DERELICT = 'derelict',   // Abandoned ship - loot, danger
  ARMADA_BASE = 'armada'   // Gilded Armada - high risk
}

export interface MapLocation {
  id: string;
  name: string;
  type: LocationType;
  x: number;  // Map coordinates (0-100)
  y: number;
  description: string;
  dangerLevel: number;  // 1-5
  discovered: boolean;
  visited: boolean;
  hasStatuePiece?: boolean;
  faction?: string;
}

/**
 * WorldMapScene - Sailing hub for exploration
 * 
 * Players navigate between locations, encountering events and
 * choosing where to explore. This is the main gameplay hub.
 */
export class WorldMapScene extends Phaser.Scene {
  private meta!: MetaProgressionManager;
  private session!: SessionStateManager;
  
  // Map state
  private locations: MapLocation[] = [];
  private playerPosition: { x: number; y: number } = { x: 20, y: 50 };
  private selectedLocation: MapLocation | null = null;
  
  // UI elements
  private mapGraphics!: Phaser.GameObjects.Graphics;
  private shipSprite!: Phaser.GameObjects.Sprite;
  private locationMarkers: Map<string, Phaser.GameObjects.Container> = new Map();
  private infoPanel!: Phaser.GameObjects.Container;
  private resourcePanel!: Phaser.GameObjects.Container;
  private dayCounter!: Phaser.GameObjects.Text;
  private curseIndicator!: Phaser.GameObjects.Container;
  
  constructor() {
    super({ key: 'WorldMapScene' });
  }
  
  create(): void {
    this.meta = MetaProgressionManager.getInstance();
    this.session = SessionStateManager.getInstance();
    
    // Initialize locations
    this.initializeLocations();
    
    // Draw the map
    this.createMapBackground();
    this.createLocationMarkers();
    this.createPlayerShip();
    this.createUI();
    
    // Set up input
    this.setupInput();
    
    console.log('[WORLD] World map initialized');
  }
  
  private initializeLocations(): void {
    // Starting port
    this.locations = [
      {
        id: 'port_haven',
        name: 'Port Haven',
        type: LocationType.PORT,
        x: 20,
        y: 50,
        description: 'A bustling trade port. Safe harbor for weary sailors.',
        dangerLevel: 1,
        discovered: true,
        visited: true,
        faction: 'Neutral'
      },
      {
        id: 'tortuga_bay',
        name: 'Tortuga Bay',
        type: LocationType.PORT,
        x: 35,
        y: 70,
        description: 'A pirate haven. Rough crowd, but good information flows freely.',
        dangerLevel: 2,
        discovered: true,
        visited: false,
        faction: 'Pirates'
      },
      {
        id: 'monastery_isle',
        name: 'Monastery Isle',
        type: LocationType.MONASTERY,
        x: 75,
        y: 25,
        description: 'The Monastery of the Watching Eye. They know more than they say.',
        dangerLevel: 1,
        discovered: false,
        visited: false
      },
      {
        id: 'serpent_caves',
        name: 'Serpent Caves',
        type: LocationType.ISLAND,
        x: 55,
        y: 60,
        description: 'Underwater caves rumored to hold ancient secrets.',
        dangerLevel: 3,
        discovered: true,
        visited: false,
        hasStatuePiece: true
      },
      {
        id: 'armada_patrol',
        name: 'Armada Patrol',
        type: LocationType.SHIP,
        x: 50,
        y: 40,
        description: 'A Gilded Armada patrol vessel. Dangerous, but potentially rewarding.',
        dangerLevel: 4,
        discovered: true,
        visited: false,
        faction: 'Gilded Armada'
      },
      {
        id: 'ghost_ship',
        name: 'The Pale Maiden',
        type: LocationType.DERELICT,
        x: 70,
        y: 55,
        description: 'An abandoned vessel drifting aimlessly. What happened to the crew?',
        dangerLevel: 3,
        discovered: false,
        visited: false
      },
      {
        id: 'drowned_reef',
        name: 'Drowned Reef',
        type: LocationType.ISLAND,
        x: 85,
        y: 70,
        description: 'Jagged rocks where the Drowned are said to gather.',
        dangerLevel: 4,
        discovered: false,
        visited: false,
        hasStatuePiece: true,
        faction: 'Drowned'
      },
      {
        id: 'armada_fort',
        name: 'Fort Gilded',
        type: LocationType.ARMADA_BASE,
        x: 30,
        y: 25,
        description: 'The Gilded Armada\'s regional headquarters. Heavily guarded.',
        dangerLevel: 5,
        discovered: true,
        visited: false,
        faction: 'Gilded Armada',
        hasStatuePiece: true
      }
    ];
    
    // Position player at starting port
    this.playerPosition = { x: 20, y: 50 };
  }
  
  private createMapBackground(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    
    // Ocean background
    this.mapGraphics = this.add.graphics();
    
    // Deep ocean
    this.mapGraphics.fillStyle(0x0a1828, 1);
    this.mapGraphics.fillRect(0, 0, width, height);
    
    // Wave patterns
    this.mapGraphics.fillStyle(0x0d1e30, 0.5);
    for (let y = 0; y < height; y += 20) {
      for (let x = 0; x < width; x += 40) {
        const offset = (y / 20) % 2 === 0 ? 0 : 20;
        this.mapGraphics.fillEllipse(x + offset, y, 30, 8);
      }
    }
    
    // Compass rose in corner
    this.drawCompassRose(720, 520);
    
    // Title
    this.add.text(400, 25, '⚓ THE CURSED SEAS ⚓', {
      fontSize: '28px',
      color: '#c9a227',
      fontStyle: 'bold'
    }).setOrigin(0.5);
  }
  
  private drawCompassRose(x: number, y: number): void {
    const g = this.add.graphics();
    g.lineStyle(2, 0x8b6914, 0.6);
    
    // Outer circle
    g.strokeCircle(x, y, 40);
    
    // Cardinal directions
    g.lineStyle(2, 0xc9a227, 0.8);
    g.lineBetween(x, y - 35, x, y + 35); // N-S
    g.lineBetween(x - 35, y, x + 35, y); // E-W
    
    // Diagonal lines
    g.lineStyle(1, 0x8b6914, 0.5);
    g.lineBetween(x - 25, y - 25, x + 25, y + 25);
    g.lineBetween(x + 25, y - 25, x - 25, y + 25);
    
    // N marker
    this.add.text(x, y - 50, 'N', {
      fontSize: '14px',
      color: '#c9a227'
    }).setOrigin(0.5);
  }
  
  private createLocationMarkers(): void {
    for (const loc of this.locations) {
      if (!loc.discovered) continue;
      
      const marker = this.createLocationMarker(loc);
      this.locationMarkers.set(loc.id, marker);
    }
  }
  
  private createLocationMarker(loc: MapLocation): Phaser.GameObjects.Container {
    // Convert map coords (0-100) to screen coords
    const screenX = 50 + (loc.x / 100) * 700;
    const screenY = 60 + (loc.y / 100) * 480;
    
    const container = this.add.container(screenX, screenY);
    
    // Marker background based on type
    const markerColor = this.getLocationColor(loc.type);
    const markerSize = loc.hasStatuePiece ? 14 : 10;
    
    const bg = this.add.graphics();
    bg.fillStyle(markerColor, 0.8);
    bg.fillCircle(0, 0, markerSize);
    bg.lineStyle(2, 0xffffff, 0.5);
    bg.strokeCircle(0, 0, markerSize);
    container.add(bg);
    
    // Statue piece indicator
    if (loc.hasStatuePiece) {
      const pieceIcon = this.add.text(0, 0, '★', {
        fontSize: '12px',
        color: '#ffd700'
      }).setOrigin(0.5);
      container.add(pieceIcon);
    }
    
    // Location name (shown on hover)
    const nameText = this.add.text(0, -20, loc.name, {
      fontSize: '11px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5).setVisible(false);
    container.add(nameText);
    
    // Danger indicator
    const dangerText = this.add.text(12, -8, '⚠'.repeat(loc.dangerLevel), {
      fontSize: '8px',
      color: this.getDangerColor(loc.dangerLevel)
    }).setVisible(false);
    container.add(dangerText);
    
    // Interactivity
    const hitArea = this.add.circle(0, 0, 20, 0x000000, 0);
    hitArea.setInteractive({ useHandCursor: true });
    container.add(hitArea);
    
    hitArea.on('pointerover', () => {
      nameText.setVisible(true);
      dangerText.setVisible(true);
      bg.clear();
      bg.fillStyle(markerColor, 1);
      bg.fillCircle(0, 0, markerSize + 2);
      bg.lineStyle(2, 0xffffff, 1);
      bg.strokeCircle(0, 0, markerSize + 2);
    });
    
    hitArea.on('pointerout', () => {
      nameText.setVisible(false);
      dangerText.setVisible(false);
      bg.clear();
      bg.fillStyle(markerColor, 0.8);
      bg.fillCircle(0, 0, markerSize);
      bg.lineStyle(2, 0xffffff, 0.5);
      bg.strokeCircle(0, 0, markerSize);
    });
    
    hitArea.on('pointerdown', () => {
      this.selectLocation(loc);
    });
    
    return container;
  }
  
  private getLocationColor(type: LocationType): number {
    switch (type) {
      case LocationType.PORT: return 0x4a90d9;
      case LocationType.ISLAND: return 0x6b8e23;
      case LocationType.SHIP: return 0xcd5c5c;
      case LocationType.MONASTERY: return 0x9370db;
      case LocationType.DERELICT: return 0x708090;
      case LocationType.ARMADA_BASE: return 0xdaa520;
      default: return 0x808080;
    }
  }
  
  private getDangerColor(level: number): string {
    if (level <= 2) return '#90ee90';
    if (level <= 3) return '#ffd700';
    return '#ff4444';
  }
  
  private createPlayerShip(): void {
    const screenX = 50 + (this.playerPosition.x / 100) * 700;
    const screenY = 60 + (this.playerPosition.y / 100) * 480;
    
    // Create ship sprite (simple triangle for now)
    const shipGraphics = this.add.graphics();
    shipGraphics.fillStyle(0x8b4513, 1);
    shipGraphics.fillTriangle(-8, 10, 8, 10, 0, -12);
    shipGraphics.lineStyle(2, 0xffffff, 0.8);
    shipGraphics.strokeTriangle(-8, 10, 8, 10, 0, -12);
    
    // Add sail
    shipGraphics.fillStyle(0xf5f5dc, 1);
    shipGraphics.fillTriangle(-6, 8, 6, 8, 0, -8);
    
    shipGraphics.generateTexture('player_ship', 20, 24);
    shipGraphics.destroy();
    
    this.shipSprite = this.add.sprite(screenX, screenY, 'player_ship');
    this.shipSprite.setDepth(100);
    
    // Bobbing animation
    this.tweens.add({
      targets: this.shipSprite,
      y: screenY + 3,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  private createUI(): void {
    this.createResourcePanel();
    this.createInfoPanel();
    this.createCurseIndicator();
    this.createActionButtons();
  }
  
  private createResourcePanel(): void {
    this.resourcePanel = this.add.container(10, 60);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(0, 0, 180, 100, 8);
    bg.lineStyle(2, 0x4a3050);
    bg.strokeRoundedRect(0, 0, 180, 100, 8);
    this.resourcePanel.add(bg);
    
    // Currency
    const currency = this.meta.save.currency;
    const currencyText = this.add.text(15, 15, `🪙 ${currency} Doubloons`, {
      fontSize: '14px',
      color: '#ffd700'
    });
    this.resourcePanel.add(currencyText);
    
    // Days remaining
    const daysRemaining = this.session.getCurse().getDaysRemaining();
    this.dayCounter = this.add.text(15, 40, `📅 ${daysRemaining} days until Blood Moon`, {
      fontSize: '12px',
      color: daysRemaining <= 7 ? '#ff4444' : '#aaaaaa'
    });
    this.resourcePanel.add(this.dayCounter);
    
    // Statue pieces
    const pieces = this.session.getStatuePieces().length;
    const piecesText = this.add.text(15, 60, `⭐ ${pieces}/7 Statue Pieces`, {
      fontSize: '12px',
      color: '#c9a227'
    });
    this.resourcePanel.add(piecesText);
    
    // Insight
    const insight = this.session.getInsight().current;
    const insightText = this.add.text(15, 80, `👁 ${insight} Insight`, {
      fontSize: '12px',
      color: '#9090ff'
    });
    this.resourcePanel.add(insightText);
  }
  
  private createInfoPanel(): void {
    this.infoPanel = this.add.container(550, 60);
    this.infoPanel.setVisible(false);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRoundedRect(0, 0, 240, 200, 8);
    bg.lineStyle(2, 0x4a3050);
    bg.strokeRoundedRect(0, 0, 240, 200, 8);
    this.infoPanel.add(bg);
  }
  
  private createCurseIndicator(): void {
    const stage = this.session.getCurse().getStage();
    
    this.curseIndicator = this.add.container(10, 170);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x200000, 0.8);
    bg.fillRoundedRect(0, 0, 180, 30, 4);
    this.curseIndicator.add(bg);
    
    const curseText = this.add.text(90, 15, `☠ Curse Stage: ${stage}/5`, {
      fontSize: '12px',
      color: stage >= 4 ? '#ff4444' : '#cc8800'
    }).setOrigin(0.5);
    this.curseIndicator.add(curseText);
  }
  
  private createActionButtons(): void {
    // Sail button (when location selected)
    const sailBtn = this.add.container(400, 550);
    sailBtn.setVisible(false);
    sailBtn.setName('sailButton');
    
    const sailBg = this.add.rectangle(0, 0, 150, 40, 0x2a5a8a);
    sailBg.setStrokeStyle(2, 0x4a90d9);
    sailBg.setInteractive({ useHandCursor: true });
    sailBtn.add(sailBg);
    
    const sailText = this.add.text(0, 0, '⛵ Set Sail', {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
    sailBtn.add(sailText);
    
    sailBg.on('pointerover', () => sailBg.setFillStyle(0x3a7aba));
    sailBg.on('pointerout', () => sailBg.setFillStyle(0x2a5a8a));
    sailBg.on('pointerdown', () => this.sailToSelected());
    
    this.add.existing(sailBtn);
    
    // Return to hub button
    const hubBtn = this.add.container(100, 550);
    
    const hubBg = this.add.rectangle(0, 0, 120, 35, 0x3a3050);
    hubBg.setStrokeStyle(2, 0x5a4070);
    hubBg.setInteractive({ useHandCursor: true });
    hubBtn.add(hubBg);
    
    const hubText = this.add.text(0, 0, '🏠 Hub', {
      fontSize: '14px',
      color: '#aaaaaa'
    }).setOrigin(0.5);
    hubBtn.add(hubText);
    
    hubBg.on('pointerover', () => hubBg.setFillStyle(0x4a4060));
    hubBg.on('pointerout', () => hubBg.setFillStyle(0x3a3050));
    hubBg.on('pointerdown', () => this.scene.start('HubScene'));
    
    // Journal button
    const journalBtn = this.add.container(700, 550);
    
    const journalBg = this.add.rectangle(0, 0, 100, 35, 0x3a3050);
    journalBg.setStrokeStyle(2, 0x5a4070);
    journalBg.setInteractive({ useHandCursor: true });
    journalBtn.add(journalBg);
    
    const journalText = this.add.text(0, 0, '📖 Journal', {
      fontSize: '14px',
      color: '#c9a227'
    }).setOrigin(0.5);
    journalBtn.add(journalText);
    
    journalBg.on('pointerover', () => journalBg.setFillStyle(0x4a4060));
    journalBg.on('pointerout', () => journalBg.setFillStyle(0x3a3050));
    journalBg.on('pointerdown', () => {
      // TODO: Open journal
      console.log('[WORLD] Journal clicked');
    });
  }
  
  private selectLocation(loc: MapLocation): void {
    this.selectedLocation = loc;
    
    // Update info panel
    this.updateInfoPanel(loc);
    
    // Show sail button
    const sailBtn = this.children.getByName('sailButton') as Phaser.GameObjects.Container;
    if (sailBtn) {
      sailBtn.setVisible(true);
    }
    
    console.log(`[WORLD] Selected: ${loc.name}`);
  }
  
  private updateInfoPanel(loc: MapLocation): void {
    // Clear existing content
    this.infoPanel.removeAll(true);
    
    // Background
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.85);
    bg.fillRoundedRect(0, 0, 240, 220, 8);
    bg.lineStyle(2, this.getLocationColor(loc.type));
    bg.strokeRoundedRect(0, 0, 240, 220, 8);
    this.infoPanel.add(bg);
    
    // Location name
    const nameText = this.add.text(120, 20, loc.name, {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    this.infoPanel.add(nameText);
    
    // Type
    const typeText = this.add.text(120, 42, this.getLocationTypeName(loc.type), {
      fontSize: '12px',
      color: '#888888'
    }).setOrigin(0.5);
    this.infoPanel.add(typeText);
    
    // Description
    const descText = this.add.text(15, 65, loc.description, {
      fontSize: '11px',
      color: '#aaaaaa',
      wordWrap: { width: 210 }
    });
    this.infoPanel.add(descText);
    
    // Danger level
    const dangerLabel = this.add.text(15, 130, 'Danger:', {
      fontSize: '12px',
      color: '#888888'
    });
    this.infoPanel.add(dangerLabel);
    
    const dangerValue = this.add.text(70, 130, '⚠'.repeat(loc.dangerLevel), {
      fontSize: '12px',
      color: this.getDangerColor(loc.dangerLevel)
    });
    this.infoPanel.add(dangerValue);
    
    // Faction if any
    if (loc.faction) {
      const factionText = this.add.text(15, 150, `Faction: ${loc.faction}`, {
        fontSize: '11px',
        color: '#aaaaaa'
      });
      this.infoPanel.add(factionText);
    }
    
    // Statue piece indicator
    if (loc.hasStatuePiece) {
      const pieceText = this.add.text(15, 175, '⭐ Statue piece rumored here', {
        fontSize: '11px',
        color: '#ffd700'
      });
      this.infoPanel.add(pieceText);
    }
    
    // Travel time (simplified - based on distance)
    const distance = Math.sqrt(
      Math.pow(loc.x - this.playerPosition.x, 2) + 
      Math.pow(loc.y - this.playerPosition.y, 2)
    );
    const travelDays = Math.max(1, Math.floor(distance / 20));
    
    const travelText = this.add.text(15, 195, `📅 Travel time: ${travelDays} day(s)`, {
      fontSize: '11px',
      color: '#6688aa'
    });
    this.infoPanel.add(travelText);
    
    this.infoPanel.setVisible(true);
  }
  
  private getLocationTypeName(type: LocationType): string {
    switch (type) {
      case LocationType.PORT: return '🏘 Port Town';
      case LocationType.ISLAND: return '🏝 Island';
      case LocationType.SHIP: return '⚔ Enemy Ship';
      case LocationType.MONASTERY: return '⛪ Monastery';
      case LocationType.DERELICT: return '👻 Derelict';
      case LocationType.ARMADA_BASE: return '🏰 Armada Base';
      default: return 'Unknown';
    }
  }
  
  private setupInput(): void {
    // ESC to deselect
    this.input.keyboard?.on('keydown-ESC', () => {
      this.selectedLocation = null;
      this.infoPanel.setVisible(false);
      const sailBtn = this.children.getByName('sailButton') as Phaser.GameObjects.Container;
      if (sailBtn) sailBtn.setVisible(false);
    });
  }
  
  private sailToSelected(): void {
    if (!this.selectedLocation) return;
    
    const loc = this.selectedLocation;
    
    // Calculate travel time
    const distance = Math.sqrt(
      Math.pow(loc.x - this.playerPosition.x, 2) + 
      Math.pow(loc.y - this.playerPosition.y, 2)
    );
    const travelDays = Math.max(1, Math.floor(distance / 20));
    
    // Advance time (curse progresses)
    this.session.advanceDay(travelDays);
    
    // Animate ship movement
    const targetX = 50 + (loc.x / 100) * 700;
    const targetY = 60 + (loc.y / 100) * 480;
    
    // Stop bobbing
    this.tweens.killTweensOf(this.shipSprite);
    
    this.tweens.add({
      targets: this.shipSprite,
      x: targetX,
      y: targetY,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => {
        // Update player position
        this.playerPosition = { x: loc.x, y: loc.y };
        loc.visited = true;
        
        // Go to appropriate scene based on location type
        this.enterLocation(loc);
      }
    });
  }
  
  private enterLocation(loc: MapLocation): void {
    console.log(`[WORLD] Entering ${loc.name} (${loc.type})`);
    
    switch (loc.type) {
      case LocationType.PORT:
      case LocationType.MONASTERY:
        // TODO: Create PortScene
        // For now, go back to this scene with a message
        this.showPortMessage(loc);
        break;
        
      case LocationType.ISLAND:
      case LocationType.SHIP:
      case LocationType.DERELICT:
      case LocationType.ARMADA_BASE:
        // Start dungeon scene with location data
        this.scene.start('GameScene', { location: loc });
        break;
        
      default:
        console.warn(`[WORLD] Unknown location type: ${loc.type}`);
    }
  }
  
  private showPortMessage(loc: MapLocation): void {
    // Use the updated port menu with trading and tavern
    this.showPortMenuUpdated(loc);
  }
  
  private restAtPort(loc: MapLocation): void {
    // Heal player, advance 1 day
    this.session.advanceDay(1);
    this.refreshResourcePanel();
    
    // Show message
    const msg = this.add.text(400, 350, '💤 You rest and recover... (+1 day)', {
      fontSize: '16px',
      color: '#44ff44',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(1000);
    
    this.tweens.add({
      targets: msg,
      alpha: 0,
      delay: 1500,
      duration: 500,
      onComplete: () => msg.destroy()
    });
  }
  
  private closePortMenu(overlay: Phaser.GameObjects.Rectangle, panel: Phaser.GameObjects.Container): void {
    overlay.destroy();
    panel.destroy();
    
    // Restart bobbing animation
    this.tweens.add({
      targets: this.shipSprite,
      y: this.shipSprite.y + 3,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  /**
   * Refresh the resource panel UI
   */
  private refreshResourcePanel(): void {
    this.resourcePanel.removeAll(true);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x000000, 0.7);
    bg.fillRoundedRect(0, 0, 180, 100, 8);
    bg.lineStyle(2, 0x4a3050);
    bg.strokeRoundedRect(0, 0, 180, 100, 8);
    this.resourcePanel.add(bg);
    
    // Currency
    const currency = this.meta.save.currency;
    const currencyText = this.add.text(15, 15, `🪙 ${currency} Doubloons`, {
      fontSize: '14px',
      color: '#ffd700'
    });
    this.resourcePanel.add(currencyText);
    
    // Days remaining
    const daysRemaining = this.session.getCurse().getDaysRemaining();
    this.dayCounter = this.add.text(15, 40, `📅 ${daysRemaining} days until Blood Moon`, {
      fontSize: '12px',
      color: daysRemaining <= 7 ? '#ff4444' : '#aaaaaa'
    });
    this.resourcePanel.add(this.dayCounter);
    
    // Statue pieces
    const pieces = this.session.getStatuePieces().length;
    const piecesText = this.add.text(15, 60, `⭐ ${pieces}/7 Statue Pieces`, {
      fontSize: '12px',
      color: '#c9a227'
    });
    this.resourcePanel.add(piecesText);
    
    // Insight
    const insight = this.session.getInsight().current;
    const insightText = this.add.text(15, 80, `👁 ${insight} Insight`, {
      fontSize: '12px',
      color: '#9090ff'
    });
    this.resourcePanel.add(insightText);
    
    // Update curse indicator too
    this.refreshCurseIndicator();
  }
  
  private refreshCurseIndicator(): void {
    this.curseIndicator.removeAll(true);
    
    const stage = this.session.getCurse().getStage();
    
    const bg = this.add.graphics();
    bg.fillStyle(0x200000, 0.8);
    bg.fillRoundedRect(0, 0, 180, 30, 4);
    this.curseIndicator.add(bg);
    
    const curseText = this.add.text(90, 15, `☠ Curse Stage: ${stage}/5`, {
      fontSize: '12px',
      color: stage >= 4 ? '#ff4444' : '#cc8800'
    }).setOrigin(0.5);
    this.curseIndicator.add(curseText);
  }
  
  // ==========================================
  // TRADING SYSTEM
  // ==========================================
  
  private openTradeMenu(loc: MapLocation, overlay: Phaser.GameObjects.Rectangle, parentPanel: Phaser.GameObjects.Container): void {
    parentPanel.setVisible(false);
    
    const tradePanel = this.add.container(400, 300);
    (overlay as any).tradePanelRef = tradePanel;
    
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1520, 1);
    bg.fillRoundedRect(-250, -200, 500, 400, 12);
    bg.lineStyle(3, 0x4a90d9);
    bg.strokeRoundedRect(-250, -200, 500, 400, 12);
    tradePanel.add(bg);
    
    const title = this.add.text(0, -170, `🛒 Trade at ${loc.name}`, {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
    tradePanel.add(title);
    
    const currency = this.meta.save.currency;
    const currencyText = this.add.text(0, -140, `Your Doubloons: ${currency}`, {
      fontSize: '14px',
      color: '#ffd700'
    }).setOrigin(0.5);
    tradePanel.add(currencyText);
    
    // Trade goods - prices vary by location
    const priceMultiplier = loc.faction === 'Pirates' ? 0.8 : (loc.faction === 'Gilded Armada' ? 1.3 : 1.0);
    
    const goods = [
      { name: '🗺 Sea Charts', desc: 'Reveals a hidden location', price: 50, effect: 'reveal_location' },
      { name: '⚗️ Curse Salve', desc: 'Slows curse by 2 days', price: 80, effect: 'slow_curse' },
      { name: '💊 Healing Herbs', desc: 'Restores health in dungeons', price: 30, effect: 'healing' },
      { name: '📜 Ancient Fragment', desc: 'Translation progress +1', price: 100, effect: 'translation' },
      { name: '🔮 Insight Crystal', desc: '+10 Insight', price: 60, effect: 'insight' },
    ];
    
    let y = -90;
    for (const good of goods) {
      const adjustedPrice = Math.floor(good.price * priceMultiplier);
      const canAfford = currency >= adjustedPrice;
      
      const itemContainer = this.add.container(-200, y);
      tradePanel.add(itemContainer);
      
      const itemBg = this.add.rectangle(125, 0, 450, 40, canAfford ? 0x2a3a4a : 0x1a1a2a);
      itemBg.setStrokeStyle(1, 0x3a4a5a);
      itemContainer.add(itemBg);
      
      const nameText = this.add.text(10, -8, good.name, {
        fontSize: '14px',
        color: canAfford ? '#ffffff' : '#666666'
      });
      itemContainer.add(nameText);
      
      const descText = this.add.text(10, 8, good.desc, {
        fontSize: '10px',
        color: '#888888'
      });
      itemContainer.add(descText);
      
      const priceText = this.add.text(380, 0, `${adjustedPrice}🪙`, {
        fontSize: '14px',
        color: canAfford ? '#ffd700' : '#664400'
      }).setOrigin(1, 0.5);
      itemContainer.add(priceText);
      
      if (canAfford) {
        itemBg.setInteractive({ useHandCursor: true });
        itemBg.on('pointerover', () => itemBg.setFillStyle(0x3a4a5a));
        itemBg.on('pointerout', () => itemBg.setFillStyle(0x2a3a4a));
        itemBg.on('pointerdown', () => {
          this.purchaseGood(good.effect, adjustedPrice, currencyText);
        });
      }
      
      y += 50;
    }
    
    // Back button
    const backBtn = this.add.text(0, 170, '← Back', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#aaaaaa'));
    backBtn.on('pointerdown', () => {
      tradePanel.destroy();
      parentPanel.setVisible(true);
    });
    tradePanel.add(backBtn);
  }
  
  private purchaseGood(effect: string, price: number, currencyText: Phaser.GameObjects.Text): void {
    // Deduct currency
    this.meta.addCurrency(-price);
    
    // Apply effect
    switch (effect) {
      case 'reveal_location':
        this.revealRandomLocation();
        break;
      case 'slow_curse':
        // Add 2 days (negative advance)
        this.session.getCurse().advanceDay(-2);
        this.showMessage('The curse\'s grip loosens... (+2 days)');
        break;
      case 'healing':
        // Store for dungeon use
        this.showMessage('Healing herbs acquired! (Use in dungeons)');
        break;
      case 'translation':
        // Add translation fragment
        this.meta.addTranslationFragment('ancient_tablet_binding');
        this.showMessage('Ancient knowledge gained! (Translation +1)');
        break;
      case 'insight':
        this.session.getInsight().gain(10, 'insight_crystal');
        this.showMessage('+10 Insight!');
        break;
    }
    
    // Update currency display
    currencyText.setText(`Your Doubloons: ${this.meta.save.currency}`);
    this.refreshResourcePanel();
  }
  
  private revealRandomLocation(): void {
    const hidden = this.locations.filter(l => !l.discovered);
    if (hidden.length === 0) {
      this.showMessage('All locations already discovered!');
      return;
    }
    
    const loc = hidden[Math.floor(Math.random() * hidden.length)];
    loc.discovered = true;
    
    // Create marker for newly discovered location
    const marker = this.createLocationMarker(loc);
    this.locationMarkers.set(loc.id, marker);
    
    this.showMessage(`Discovered: ${loc.name}!`);
  }
  
  // ==========================================
  // TAVERN SYSTEM
  // ==========================================
  
  private openTavern(loc: MapLocation, overlay: Phaser.GameObjects.Rectangle, parentPanel: Phaser.GameObjects.Container): void {
    parentPanel.setVisible(false);
    
    const tavernPanel = this.add.container(400, 300);
    (overlay as any).tavernPanelRef = tavernPanel;
    
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1510, 1);
    bg.fillRoundedRect(-250, -200, 500, 400, 12);
    bg.lineStyle(3, 0x8b6914);
    bg.strokeRoundedRect(-250, -200, 500, 400, 12);
    tavernPanel.add(bg);
    
    const title = this.add.text(0, -170, `🍺 Tavern at ${loc.name}`, {
      fontSize: '20px',
      color: '#c9a227'
    }).setOrigin(0.5);
    tavernPanel.add(title);
    
    const subtitle = this.add.text(0, -145, 'Rumors flow freely here...', {
      fontSize: '12px',
      color: '#888888'
    }).setOrigin(0.5);
    tavernPanel.add(subtitle);
    
    // Rumors available - cost and reliability vary
    const rumors = this.generateRumors(loc);
    
    let y = -90;
    for (const rumor of rumors) {
      const currency = this.meta.save.currency;
      const canAfford = currency >= rumor.price;
      
      const rumorContainer = this.add.container(-200, y);
      tavernPanel.add(rumorContainer);
      
      const rumorBg = this.add.rectangle(125, 0, 450, 55, canAfford ? 0x2a2520 : 0x1a1510);
      rumorBg.setStrokeStyle(1, 0x4a4030);
      rumorContainer.add(rumorBg);
      
      const sourceText = this.add.text(10, -15, rumor.source, {
        fontSize: '12px',
        color: this.getRumorSourceColor(rumor.reliability)
      });
      rumorContainer.add(sourceText);
      
      const teaser = rumor.teaser.length > 50 ? rumor.teaser.substring(0, 47) + '...' : rumor.teaser;
      const teaserText = this.add.text(10, 5, `"${teaser}"`, {
        fontSize: '11px',
        color: '#aaaaaa',
        fontStyle: 'italic'
      });
      rumorContainer.add(teaserText);
      
      const priceText = this.add.text(380, 0, `${rumor.price}🪙`, {
        fontSize: '14px',
        color: canAfford ? '#ffd700' : '#664400'
      }).setOrigin(1, 0.5);
      rumorContainer.add(priceText);
      
      if (canAfford) {
        rumorBg.setInteractive({ useHandCursor: true });
        rumorBg.on('pointerover', () => rumorBg.setFillStyle(0x3a3530));
        rumorBg.on('pointerout', () => rumorBg.setFillStyle(0x2a2520));
        rumorBg.on('pointerdown', () => {
          this.purchaseRumor(rumor, tavernPanel);
        });
      }
      
      y += 65;
    }
    
    // Back button
    const backBtn = this.add.text(0, 170, '← Back', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    backBtn.on('pointerover', () => backBtn.setColor('#ffffff'));
    backBtn.on('pointerout', () => backBtn.setColor('#aaaaaa'));
    backBtn.on('pointerdown', () => {
      tavernPanel.destroy();
      parentPanel.setVisible(true);
    });
    tavernPanel.add(backBtn);
  }
  
  private generateRumors(loc: MapLocation): Array<{
    source: string;
    teaser: string;
    fullInfo: string;
    price: number;
    reliability: 'low' | 'medium' | 'high';
    effect?: string;
    insightGain: number;
  }> {
    const rumors = [];
    const insight = this.session.getInsight().current;
    
    // Always have some generic rumors
    rumors.push({
      source: '🍺 Drunk Sailor',
      teaser: 'The Armada\'s been moving ships toward the eastern reef...',
      fullInfo: 'The Gilded Armada has increased patrols near the Drowned Reef. They\'re looking for something specific - probably a statue piece. Be careful if you head that way.',
      price: 10,
      reliability: 'medium' as const,
      insightGain: 2
    });
    
    rumors.push({
      source: '👤 Hooded Stranger',
      teaser: 'The monks know more than they say about the curse...',
      fullInfo: 'The Monastery has records dating back to when the Drowned Sovereign first appeared. They speak of a "third path" - neither serving the depths nor the golden light. But they won\'t share freely.',
      price: 25,
      reliability: 'high' as const,
      insightGain: 5,
      effect: 'reveal_monastery'
    });
    
    if (loc.faction === 'Pirates') {
      rumors.push({
        source: '🏴‍☠️ Grizzled Pirate',
        teaser: 'I know where a piece of that statue is hidden...',
        fullInfo: 'The Serpent Caves hold a statue fragment. But beware - the caves are deeper than they appear, and something guards the piece. Something that used to be human.',
        price: 40,
        reliability: 'high' as const,
        insightGain: 8
      });
    }
    
    // High insight reveals more detailed rumors
    if (insight >= 30) {
      rumors.push({
        source: '😰 Nervous Merchant',
        teaser: 'The Armada officers... their eyes aren\'t right...',
        fullInfo: 'I\'ve traded with the Armada for years. But lately... the officers move wrong. Speak wrong. They smile too much and their eyes catch light that isn\'t there. I think something\'s taken them.',
        price: 30,
        reliability: 'high' as const,
        insightGain: 10
      });
    }
    
    // Unreliable rumors (may be false or traps)
    rumors.push({
      source: '🎭 Smooth Talker',
      teaser: 'Assemble the statue quickly - it\'s the only way to break your curse...',
      fullInfo: 'The statue pieces must be assembled at the underwater temple. Once complete, the Drowned Sovereign will grant you freedom from the curse. Trust me.',
      price: 5,
      reliability: 'low' as const,
      insightGain: 1
    });
    
    return rumors.slice(0, 4); // Max 4 rumors
  }
  
  private getRumorSourceColor(reliability: 'low' | 'medium' | 'high'): string {
    switch (reliability) {
      case 'high': return '#44aa44';
      case 'medium': return '#aaaa44';
      case 'low': return '#aa4444';
    }
  }
  
  private purchaseRumor(rumor: any, panel: Phaser.GameObjects.Container): void {
    // Deduct cost
    this.meta.addCurrency(-rumor.price);
    
    // Gain insight
    this.session.getInsight().gain(rumor.insightGain, 'tavern_rumor');
    
    // Show full rumor
    panel.removeAll(true);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1510, 1);
    bg.fillRoundedRect(-250, -200, 500, 400, 12);
    bg.lineStyle(3, 0x8b6914);
    bg.strokeRoundedRect(-250, -200, 500, 400, 12);
    panel.add(bg);
    
    const title = this.add.text(0, -170, rumor.source, {
      fontSize: '18px',
      color: this.getRumorSourceColor(rumor.reliability)
    }).setOrigin(0.5);
    panel.add(title);
    
    const reliabilityText = this.add.text(0, -145, `Reliability: ${rumor.reliability.toUpperCase()}`, {
      fontSize: '12px',
      color: this.getRumorSourceColor(rumor.reliability)
    }).setOrigin(0.5);
    panel.add(reliabilityText);
    
    const infoText = this.add.text(0, -50, rumor.fullInfo, {
      fontSize: '14px',
      color: '#cccccc',
      wordWrap: { width: 440 },
      align: 'center'
    }).setOrigin(0.5, 0);
    panel.add(infoText);
    
    const insightText = this.add.text(0, 100, `+${rumor.insightGain} Insight`, {
      fontSize: '14px',
      color: '#9090ff'
    }).setOrigin(0.5);
    panel.add(insightText);
    
    // Apply special effects
    if (rumor.effect === 'reveal_monastery') {
      const monastery = this.locations.find(l => l.id === 'monastery_isle');
      if (monastery && !monastery.discovered) {
        monastery.discovered = true;
        const marker = this.createLocationMarker(monastery);
        this.locationMarkers.set(monastery.id, marker);
        
        const revealText = this.add.text(0, 130, '📍 Monastery Isle revealed on map!', {
          fontSize: '12px',
          color: '#44ff44'
        }).setOrigin(0.5);
        panel.add(revealText);
      }
    }
    
    // Close button
    const closeBtn = this.add.text(0, 170, 'Continue', {
      fontSize: '16px',
      color: '#c9a227'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    
    closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#c9a227'));
    closeBtn.on('pointerdown', () => {
      panel.destroy();
      this.refreshResourcePanel();
    });
    panel.add(closeBtn);
  }
  
  private showMessage(text: string): void {
    const msg = this.add.text(400, 500, text, {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5).setDepth(1000);
    
    this.tweens.add({
      targets: msg,
      alpha: 0,
      y: msg.y - 50,
      delay: 2000,
      duration: 500,
      onComplete: () => msg.destroy()
    });
  }
  
  // Update the port menu to use the new systems
  private showPortMenuUpdated(loc: MapLocation): void {
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    overlay.setDepth(500);
    
    const panel = this.add.container(400, 300);
    panel.setDepth(501);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1520, 1);
    bg.fillRoundedRect(-200, -180, 400, 360, 12);
    bg.lineStyle(3, this.getLocationColor(loc.type));
    bg.strokeRoundedRect(-200, -180, 400, 360, 12);
    panel.add(bg);
    
    const title = this.add.text(0, -150, `Welcome to ${loc.name}`, {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
    panel.add(title);
    
    const desc = this.add.text(0, -110, loc.description, {
      fontSize: '12px',
      color: '#aaaaaa',
      wordWrap: { width: 350 },
      align: 'center'
    }).setOrigin(0.5);
    panel.add(desc);
    
    // Port options
    const options = [
      { text: '🛒 Trade Goods', action: () => this.openTradeMenu(loc, overlay, panel) },
      { text: '🍺 Visit Tavern', action: () => this.openTavern(loc, overlay, panel) },
      { text: '💤 Rest (+1 Day)', action: () => { this.restAtPort(loc); } },
      { text: '🚪 Leave', action: () => this.closePortMenuUpdated(overlay, panel) }
    ];
    
    let y = -30;
    for (const opt of options) {
      const btnBg = this.add.rectangle(0, y, 200, 35, 0x2a2a3a);
      btnBg.setStrokeStyle(1, 0x4a4a5a);
      btnBg.setInteractive({ useHandCursor: true });
      panel.add(btnBg);
      
      const btnText = this.add.text(0, y, opt.text, {
        fontSize: '16px',
        color: '#c9a227'
      }).setOrigin(0.5);
      panel.add(btnText);
      
      btnBg.on('pointerover', () => {
        btnBg.setFillStyle(0x3a3a4a);
        btnText.setColor('#ffffff');
      });
      btnBg.on('pointerout', () => {
        btnBg.setFillStyle(0x2a2a3a);
        btnText.setColor('#c9a227');
      });
      btnBg.on('pointerdown', opt.action);
      
      y += 50;
    }
    
    // Store references
    (overlay as any).panelRef = panel;
  }
  
  private closePortMenuUpdated(overlay: Phaser.GameObjects.Rectangle, panel: Phaser.GameObjects.Container): void {
    // Clean up any sub-panels
    if ((overlay as any).tradePanelRef) {
      (overlay as any).tradePanelRef.destroy();
    }
    if ((overlay as any).tavernPanelRef) {
      (overlay as any).tavernPanelRef.destroy();
    }
    
    overlay.destroy();
    panel.destroy();
    
    // Restart bobbing animation
    this.tweens.add({
      targets: this.shipSprite,
      y: this.shipSprite.y + 3,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}

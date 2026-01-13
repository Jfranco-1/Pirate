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
    // Temporary port interaction until PortScene is created
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
    
    const panel = this.add.container(400, 300);
    
    const bg = this.add.graphics();
    bg.fillStyle(0x1a1520, 1);
    bg.fillRoundedRect(-200, -150, 400, 300, 12);
    bg.lineStyle(3, this.getLocationColor(loc.type));
    bg.strokeRoundedRect(-200, -150, 400, 300, 12);
    panel.add(bg);
    
    const title = this.add.text(0, -120, `Welcome to ${loc.name}`, {
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);
    panel.add(title);
    
    const desc = this.add.text(0, -60, loc.description, {
      fontSize: '14px',
      color: '#aaaaaa',
      wordWrap: { width: 350 },
      align: 'center'
    }).setOrigin(0.5);
    panel.add(desc);
    
    // Port options
    const options = [
      { text: '🛒 Trade Goods', action: () => console.log('Trade') },
      { text: '🍺 Visit Tavern', action: () => console.log('Tavern') },
      { text: '💤 Rest (Heal)', action: () => this.restAtPort(loc) },
      { text: '🚪 Leave', action: () => this.closePortMenu(overlay, panel) }
    ];
    
    let y = 0;
    for (const opt of options) {
      const btn = this.add.text(0, y, opt.text, {
        fontSize: '16px',
        color: '#c9a227'
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });
      
      btn.on('pointerover', () => btn.setColor('#ffffff'));
      btn.on('pointerout', () => btn.setColor('#c9a227'));
      btn.on('pointerdown', opt.action);
      
      panel.add(btn);
      y += 35;
    }
    
    // Store references for cleanup
    (overlay as any).panelRef = panel;
  }
  
  private restAtPort(loc: MapLocation): void {
    // Heal player, advance 1 day
    this.session.advanceDay(1);
    // TODO: Actually heal when we have player health tracking in session
    
    this.add.text(400, 400, 'You rest and recover...', {
      fontSize: '14px',
      color: '#44ff44'
    }).setOrigin(0.5);
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
}

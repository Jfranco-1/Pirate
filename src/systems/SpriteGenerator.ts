import Phaser from 'phaser';

/**
 * SpriteGenerator - Creates pixel art sprites programmatically
 * 
 * Generates all game sprites using Phaser's graphics API so we don't need
 * external asset files. Each sprite is designed with a pirate/nautical theme.
 */
export class SpriteGenerator {
  private scene: Phaser.Scene;
  private generated: Set<string> = new Set();
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }
  
  /**
   * Generate all sprites needed for the game
   */
  generateAll(): void {
    // Player sprites
    this.generatePlayerSprite('player_duelist', 0xff4444);     // Red
    this.generatePlayerSprite('player_quartermaster', 0xffaa00); // Gold
    this.generatePlayerSprite('player_navigator', 0x00aaff);   // Blue
    this.generatePlayerSprite('player_chaplain', 0xaa44ff);    // Purple
    
    // Enemy sprites
    this.generateMarineSprite();
    this.generateMusketeerSprite();
    this.generateOfficerSprite();
    this.generateDrownedSprite();
    this.generateBruteSprite();
    
    // Tile sprites
    this.generateWoodFloorTile();
    this.generateWoodWallTile();
    this.generateWaterTile();
    this.generateDoorTile();
    this.generateStairsTile();
    this.generateCargoTile();
    
    // Item sprites
    this.generateHealthPotionSprite();
    this.generateStrengthPotionSprite();
    this.generateBombSprite();
    this.generateTreasureSprite();
    
    // UI elements
    this.generateParticle();
    this.generateCurseOverlay();
    this.generateInsightOrb();
  }
  
  /**
   * Generate a pirate player sprite
   */
  private generatePlayerSprite(key: string, color: number): void {
    if (this.generated.has(key)) return;
    
    const size = 28;
    const g = this.scene.add.graphics();
    
    // Body (simple humanoid shape)
    g.fillStyle(color, 1);
    g.fillRect(8, 8, 12, 14);  // Torso
    
    // Head
    g.fillStyle(0xffcc99, 1);  // Skin tone
    g.fillRect(10, 2, 8, 8);
    
    // Bandana/Hat
    g.fillStyle(color, 1);
    g.fillRect(9, 1, 10, 3);
    
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillRect(12, 5, 2, 2);
    g.fillRect(16, 5, 2, 2);
    
    // Legs
    g.fillStyle(0x333333, 1);
    g.fillRect(9, 22, 4, 5);
    g.fillRect(15, 22, 4, 5);
    
    // Arms
    g.fillStyle(0xffcc99, 1);
    g.fillRect(4, 10, 4, 8);
    g.fillRect(20, 10, 4, 8);
    
    // Sword (right hand)
    g.fillStyle(0xcccccc, 1);
    g.fillRect(22, 4, 2, 10);
    g.fillStyle(0xffcc00, 1);
    g.fillRect(22, 12, 2, 3);
    
    // Outline
    g.lineStyle(1, 0x000000, 0.5);
    g.strokeRect(8, 8, 12, 14);
    
    g.generateTexture(key, size, size);
    g.destroy();
    this.generated.add(key);
  }
  
  /**
   * Generate Armada Marine sprite (basic melee enemy)
   */
  private generateMarineSprite(): void {
    if (this.generated.has('enemy_marine')) return;
    
    const size = 28;
    const g = this.scene.add.graphics();
    
    // Blue uniform
    g.fillStyle(0x2244aa, 1);
    g.fillRect(8, 8, 12, 14);
    
    // Gold trim (Armada colors)
    g.fillStyle(0xffcc00, 1);
    g.fillRect(8, 8, 12, 2);
    g.fillRect(8, 20, 12, 2);
    
    // Head with helmet
    g.fillStyle(0x333333, 1);
    g.fillRect(9, 1, 10, 8);
    g.fillStyle(0xffcc99, 1);
    g.fillRect(11, 4, 6, 4);
    
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillRect(12, 5, 2, 2);
    g.fillRect(16, 5, 2, 2);
    
    // Legs
    g.fillStyle(0x222266, 1);
    g.fillRect(9, 22, 4, 5);
    g.fillRect(15, 22, 4, 5);
    
    // Arms with gauntlets
    g.fillStyle(0x333333, 1);
    g.fillRect(4, 10, 4, 8);
    g.fillRect(20, 10, 4, 8);
    
    // Sword
    g.fillStyle(0xcccccc, 1);
    g.fillRect(22, 2, 2, 12);
    
    g.generateTexture('enemy_marine', size, size);
    g.destroy();
    this.generated.add('enemy_marine');
  }
  
  /**
   * Generate Musketeer sprite (ranged enemy)
   */
  private generateMusketeerSprite(): void {
    if (this.generated.has('enemy_musketeer')) return;
    
    const size = 28;
    const g = this.scene.add.graphics();
    
    // Blue coat
    g.fillStyle(0x2255bb, 1);
    g.fillRect(8, 8, 12, 14);
    
    // Gold buttons
    g.fillStyle(0xffcc00, 1);
    g.fillRect(13, 10, 2, 2);
    g.fillRect(13, 14, 2, 2);
    g.fillRect(13, 18, 2, 2);
    
    // Head with tricorn hat
    g.fillStyle(0x222222, 1);
    g.fillTriangle(14, 0, 6, 6, 22, 6);  // Hat
    g.fillStyle(0xffcc99, 1);
    g.fillRect(10, 4, 8, 6);
    
    // Eyes
    g.fillStyle(0x000000, 1);
    g.fillRect(12, 6, 2, 2);
    g.fillRect(16, 6, 2, 2);
    
    // Legs
    g.fillStyle(0x444466, 1);
    g.fillRect(9, 22, 4, 5);
    g.fillRect(15, 22, 4, 5);
    
    // Arms
    g.fillStyle(0x2255bb, 1);
    g.fillRect(4, 10, 4, 8);
    g.fillRect(20, 10, 4, 8);
    
    // Musket
    g.fillStyle(0x663300, 1);
    g.fillRect(22, 6, 6, 3);  // Stock
    g.fillStyle(0x444444, 1);
    g.fillRect(24, 2, 2, 6);  // Barrel
    
    g.generateTexture('enemy_musketeer', size, size);
    g.destroy();
    this.generated.add('enemy_musketeer');
  }
  
  /**
   * Generate Officer sprite (elite enemy with buffs)
   */
  private generateOfficerSprite(): void {
    if (this.generated.has('enemy_officer')) return;
    
    const size = 28;
    const g = this.scene.add.graphics();
    
    // White/gold uniform (high rank)
    g.fillStyle(0xeeeedd, 1);
    g.fillRect(8, 8, 12, 14);
    
    // Gold epaulettes
    g.fillStyle(0xffcc00, 1);
    g.fillRect(6, 8, 4, 4);
    g.fillRect(18, 8, 4, 4);
    
    // Sash
    g.fillStyle(0xcc0000, 1);
    g.fillRect(8, 10, 12, 3);
    
    // Head with plumed hat
    g.fillStyle(0x111133, 1);
    g.fillRect(8, 0, 12, 7);
    g.fillStyle(0xff4444, 1);
    g.fillRect(16, -2, 4, 6);  // Plume
    g.fillStyle(0xffcc99, 1);
    g.fillRect(10, 4, 8, 5);
    
    // Eyes (more menacing)
    g.fillStyle(0xffcc00, 1);  // Yellow eyes hint at influence
    g.fillRect(12, 5, 2, 2);
    g.fillRect(16, 5, 2, 2);
    
    // Legs
    g.fillStyle(0x222244, 1);
    g.fillRect(9, 22, 4, 5);
    g.fillRect(15, 22, 4, 5);
    
    // Arms
    g.fillStyle(0xeeeedd, 1);
    g.fillRect(4, 10, 4, 8);
    g.fillRect(20, 10, 4, 8);
    
    // Rapier
    g.fillStyle(0xeeeeee, 1);
    g.fillRect(23, 0, 2, 14);
    g.fillStyle(0xffcc00, 1);
    g.fillRect(22, 12, 4, 3);
    
    g.generateTexture('enemy_officer', size, size);
    g.destroy();
    this.generated.add('enemy_officer');
  }
  
  /**
   * Generate Drowned sailor sprite (corrupted enemy)
   */
  private generateDrownedSprite(): void {
    if (this.generated.has('enemy_drowned')) return;
    
    const size = 28;
    const g = this.scene.add.graphics();
    
    // Tattered, waterlogged clothes
    g.fillStyle(0x336655, 1);  // Sea-green
    g.fillRect(8, 8, 12, 14);
    
    // Barnacles/seaweed
    g.fillStyle(0x225544, 1);
    g.fillRect(6, 12, 3, 4);
    g.fillRect(19, 14, 3, 4);
    
    // Pale, bloated head
    g.fillStyle(0x88aaaa, 1);
    g.fillRect(9, 2, 10, 8);
    
    // Glowing eyes (teal)
    g.fillStyle(0x00ffcc, 1);
    g.fillRect(11, 4, 3, 3);
    g.fillRect(16, 4, 3, 3);
    
    // Tentacle hint
    g.fillStyle(0x448866, 1);
    g.fillRect(3, 18, 3, 6);
    g.fillRect(22, 16, 3, 8);
    
    // Legs (partially webbed)
    g.fillStyle(0x447766, 1);
    g.fillRect(9, 22, 4, 6);
    g.fillRect(15, 22, 4, 6);
    
    // Waterline effect
    g.fillStyle(0x003344, 0.3);
    g.fillRect(0, 20, 28, 8);
    
    g.generateTexture('enemy_drowned', size, size);
    g.destroy();
    this.generated.add('enemy_drowned');
  }
  
  /**
   * Generate Brute sprite (heavy enemy)
   */
  private generateBruteSprite(): void {
    if (this.generated.has('enemy_brute')) return;
    
    const size = 28;
    const g = this.scene.add.graphics();
    
    // Large, muscular body
    g.fillStyle(0x664422, 1);
    g.fillRect(5, 6, 18, 16);
    
    // Leather straps
    g.fillStyle(0x443311, 1);
    g.fillRect(5, 8, 18, 2);
    g.fillRect(5, 14, 18, 2);
    
    // Head (small compared to body)
    g.fillStyle(0xcc9966, 1);
    g.fillRect(10, 0, 8, 7);
    
    // Angry eyes
    g.fillStyle(0xff0000, 1);
    g.fillRect(12, 2, 2, 2);
    g.fillRect(16, 2, 2, 2);
    
    // Scar
    g.fillStyle(0x883333, 1);
    g.fillRect(11, 4, 6, 1);
    
    // Massive arms
    g.fillStyle(0xcc9966, 1);
    g.fillRect(0, 8, 6, 12);
    g.fillRect(22, 8, 6, 12);
    
    // Legs
    g.fillStyle(0x553322, 1);
    g.fillRect(7, 22, 6, 6);
    g.fillRect(15, 22, 6, 6);
    
    // Club/anchor
    g.fillStyle(0x444444, 1);
    g.fillRect(24, 0, 4, 16);
    g.fillRect(22, 0, 8, 4);
    
    g.generateTexture('enemy_brute', size, size);
    g.destroy();
    this.generated.add('enemy_brute');
  }
  
  /**
   * Generate wood floor tile
   */
  private generateWoodFloorTile(): void {
    if (this.generated.has('tile_floor')) return;
    
    const size = 32;
    const g = this.scene.add.graphics();
    
    // Base wood color
    g.fillStyle(0x5c4033, 1);
    g.fillRect(0, 0, size, size);
    
    // Wood grain lines
    g.fillStyle(0x4a3328, 1);
    for (let y = 4; y < size; y += 8) {
      g.fillRect(0, y, size, 1);
    }
    
    // Plank divisions
    g.fillStyle(0x3d2817, 1);
    g.fillRect(10, 0, 1, size);
    g.fillRect(21, 0, 1, size);
    
    // Nail heads
    g.fillStyle(0x333333, 1);
    g.fillRect(2, 2, 2, 2);
    g.fillRect(14, 2, 2, 2);
    g.fillRect(26, 2, 2, 2);
    g.fillRect(2, 28, 2, 2);
    g.fillRect(14, 28, 2, 2);
    g.fillRect(26, 28, 2, 2);
    
    // Subtle highlight
    g.fillStyle(0x6d5144, 0.3);
    g.fillRect(0, 0, size, 2);
    
    g.generateTexture('tile_floor', size, size);
    g.destroy();
    this.generated.add('tile_floor');
  }
  
  /**
   * Generate wood wall tile
   */
  private generateWoodWallTile(): void {
    if (this.generated.has('tile_wall')) return;
    
    const size = 32;
    const g = this.scene.add.graphics();
    
    // Dark wood base
    g.fillStyle(0x2a1f14, 1);
    g.fillRect(0, 0, size, size);
    
    // Vertical planks
    g.fillStyle(0x3d2817, 1);
    for (let x = 0; x < size; x += 8) {
      g.fillRect(x, 0, 7, size);
    }
    
    // Darker gaps
    g.fillStyle(0x1a0f04, 1);
    for (let x = 7; x < size; x += 8) {
      g.fillRect(x, 0, 1, size);
    }
    
    // Cross beam
    g.fillStyle(0x4a3328, 1);
    g.fillRect(0, 12, size, 4);
    
    // Bolts
    g.fillStyle(0x555555, 1);
    g.fillRect(4, 13, 2, 2);
    g.fillRect(14, 13, 2, 2);
    g.fillRect(24, 13, 2, 2);
    
    g.generateTexture('tile_wall', size, size);
    g.destroy();
    this.generated.add('tile_wall');
  }
  
  /**
   * Generate water tile
   */
  private generateWaterTile(): void {
    if (this.generated.has('tile_water')) return;
    
    const size = 32;
    const g = this.scene.add.graphics();
    
    // Deep water base
    g.fillStyle(0x1a3344, 1);
    g.fillRect(0, 0, size, size);
    
    // Wave highlights
    g.fillStyle(0x2a4455, 1);
    g.fillRect(2, 8, 8, 2);
    g.fillRect(14, 4, 10, 2);
    g.fillRect(6, 20, 12, 2);
    g.fillRect(20, 26, 8, 2);
    
    // Foam
    g.fillStyle(0x446677, 0.5);
    g.fillRect(4, 10, 4, 1);
    g.fillRect(18, 6, 4, 1);
    
    g.generateTexture('tile_water', size, size);
    g.destroy();
    this.generated.add('tile_water');
  }
  
  /**
   * Generate door tile
   */
  private generateDoorTile(): void {
    if (this.generated.has('tile_door')) return;
    
    const size = 32;
    const g = this.scene.add.graphics();
    
    // Floor underneath
    g.fillStyle(0x5c4033, 1);
    g.fillRect(0, 0, size, size);
    
    // Door frame
    g.fillStyle(0x4a3328, 1);
    g.fillRect(4, 0, 24, size);
    
    // Door panels
    g.fillStyle(0x5c4033, 1);
    g.fillRect(6, 2, 9, 12);
    g.fillRect(17, 2, 9, 12);
    g.fillRect(6, 16, 9, 12);
    g.fillRect(17, 16, 9, 12);
    
    // Handle
    g.fillStyle(0xccaa00, 1);
    g.fillRect(14, 14, 4, 4);
    
    g.generateTexture('tile_door', size, size);
    g.destroy();
    this.generated.add('tile_door');
  }
  
  /**
   * Generate stairs tile
   */
  private generateStairsTile(): void {
    if (this.generated.has('tile_stairs')) return;
    
    const size = 32;
    const g = this.scene.add.graphics();
    
    // Base
    g.fillStyle(0x3d2817, 1);
    g.fillRect(0, 0, size, size);
    
    // Steps
    for (let i = 0; i < 4; i++) {
      const y = i * 8;
      g.fillStyle(0x5c4033, 1);
      g.fillRect(2 + i * 2, y, size - 4 - i * 4, 6);
      g.fillStyle(0x6d5144, 1);
      g.fillRect(2 + i * 2, y, size - 4 - i * 4, 2);
    }
    
    // Arrow indicator
    g.fillStyle(0xffcc00, 0.7);
    g.fillTriangle(16, 4, 10, 14, 22, 14);
    
    g.generateTexture('tile_stairs', size, size);
    g.destroy();
    this.generated.add('tile_stairs');
  }
  
  /**
   * Generate cargo/crate tile
   */
  private generateCargoTile(): void {
    if (this.generated.has('tile_cargo')) return;
    
    const size = 32;
    const g = this.scene.add.graphics();
    
    // Floor
    g.fillStyle(0x5c4033, 1);
    g.fillRect(0, 0, size, size);
    
    // Crate
    g.fillStyle(0x8b7355, 1);
    g.fillRect(4, 8, 24, 20);
    
    // Crate bands
    g.fillStyle(0x664433, 1);
    g.fillRect(4, 12, 24, 2);
    g.fillRect(4, 22, 24, 2);
    
    // Crate top
    g.fillStyle(0x9b8365, 1);
    g.fillRect(4, 4, 24, 6);
    
    // Shadow
    g.fillStyle(0x000000, 0.2);
    g.fillRect(6, 26, 22, 4);
    
    g.generateTexture('tile_cargo', size, size);
    g.destroy();
    this.generated.add('tile_cargo');
  }
  
  /**
   * Generate health potion sprite
   */
  private generateHealthPotionSprite(): void {
    if (this.generated.has('item_health')) return;
    
    const size = 20;
    const g = this.scene.add.graphics();
    
    // Bottle
    g.fillStyle(0x333333, 1);
    g.fillRect(7, 2, 6, 4);  // Neck
    g.fillStyle(0xff3333, 1);
    g.fillRect(4, 6, 12, 12);  // Body
    
    // Highlight
    g.fillStyle(0xff6666, 0.5);
    g.fillRect(6, 8, 3, 8);
    
    // Cork
    g.fillStyle(0x8b4513, 1);
    g.fillRect(8, 0, 4, 3);
    
    g.generateTexture('item_health', size, size);
    g.destroy();
    this.generated.add('item_health');
  }
  
  /**
   * Generate strength potion sprite
   */
  private generateStrengthPotionSprite(): void {
    if (this.generated.has('item_strength')) return;
    
    const size = 20;
    const g = this.scene.add.graphics();
    
    // Bottle
    g.fillStyle(0x333333, 1);
    g.fillRect(7, 2, 6, 4);
    g.fillStyle(0xff6600, 1);
    g.fillRect(4, 6, 12, 12);
    
    // Highlight
    g.fillStyle(0xff9933, 0.5);
    g.fillRect(6, 8, 3, 8);
    
    // Cork
    g.fillStyle(0x8b4513, 1);
    g.fillRect(8, 0, 4, 3);
    
    g.generateTexture('item_strength', size, size);
    g.destroy();
    this.generated.add('item_strength');
  }
  
  /**
   * Generate bomb sprite
   */
  private generateBombSprite(): void {
    if (this.generated.has('item_bomb')) return;
    
    const size = 20;
    const g = this.scene.add.graphics();
    
    // Bomb body
    g.fillStyle(0x222222, 1);
    g.fillCircle(10, 12, 7);
    
    // Fuse
    g.fillStyle(0x8b4513, 1);
    g.fillRect(9, 2, 2, 5);
    
    // Spark
    g.fillStyle(0xffcc00, 1);
    g.fillRect(8, 0, 4, 3);
    g.fillStyle(0xff6600, 1);
    g.fillRect(9, 1, 2, 2);
    
    // Highlight
    g.fillStyle(0x444444, 1);
    g.fillCircle(7, 10, 2);
    
    g.generateTexture('item_bomb', size, size);
    g.destroy();
    this.generated.add('item_bomb');
  }
  
  /**
   * Generate treasure sprite
   */
  private generateTreasureSprite(): void {
    if (this.generated.has('item_treasure')) return;
    
    const size = 20;
    const g = this.scene.add.graphics();
    
    // Chest
    g.fillStyle(0x8b4513, 1);
    g.fillRect(2, 8, 16, 10);
    
    // Lid
    g.fillStyle(0x654321, 1);
    g.fillRect(2, 4, 16, 5);
    
    // Gold trim
    g.fillStyle(0xffcc00, 1);
    g.fillRect(2, 8, 16, 2);
    g.fillRect(8, 4, 4, 14);
    
    // Lock
    g.fillStyle(0xffcc00, 1);
    g.fillRect(8, 9, 4, 4);
    
    // Glow hint
    g.fillStyle(0xffff00, 0.3);
    g.fillRect(0, 2, 20, 18);
    
    g.generateTexture('item_treasure', size, size);
    g.destroy();
    this.generated.add('item_treasure');
  }
  
  /**
   * Generate particle texture
   */
  private generateParticle(): void {
    if (this.generated.has('particle')) return;
    
    const g = this.scene.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillCircle(2, 2, 2);
    g.generateTexture('particle', 4, 4);
    g.destroy();
    this.generated.add('particle');
  }
  
  /**
   * Generate curse overlay effect
   */
  private generateCurseOverlay(): void {
    if (this.generated.has('curse_vein')) return;
    
    const g = this.scene.add.graphics();
    
    // Dark tendril pattern
    g.fillStyle(0x330033, 0.5);
    g.fillRect(0, 0, 64, 64);
    
    // Veins
    g.lineStyle(2, 0x660066, 0.7);
    g.lineBetween(0, 32, 64, 32);
    g.lineBetween(32, 0, 32, 64);
    g.lineBetween(0, 0, 64, 64);
    g.lineBetween(64, 0, 0, 64);
    
    g.generateTexture('curse_vein', 64, 64);
    g.destroy();
    this.generated.add('curse_vein');
  }
  
  /**
   * Generate insight orb for UI
   */
  private generateInsightOrb(): void {
    if (this.generated.has('insight_orb')) return;
    
    const g = this.scene.add.graphics();
    
    // Outer glow
    g.fillStyle(0x00ffff, 0.3);
    g.fillCircle(16, 16, 14);
    
    // Inner orb
    g.fillStyle(0x00aaff, 0.8);
    g.fillCircle(16, 16, 10);
    
    // Highlight
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(12, 12, 4);
    
    g.generateTexture('insight_orb', 32, 32);
    g.destroy();
    this.generated.add('insight_orb');
  }
  
  /**
   * Generate a simple entity texture (fallback)
   */
  generateEntityTexture(): void {
    if (this.generated.has('entity')) return;
    
    const g = this.scene.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 28, 28);
    g.generateTexture('entity', 28, 28);
    g.destroy();
    this.generated.add('entity');
  }
}

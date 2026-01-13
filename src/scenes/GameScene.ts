import Phaser from 'phaser';
import * as ROT from 'rot-js';
import { GridManager } from '../systems/GridManager';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { Goblin } from '../entities/enemies/Goblin';
import { Archer } from '../entities/enemies/Archer';
import { Brute } from '../entities/enemies/Brute';
import { TurnManager } from '../systems/TurnManager';
import { FloatingText } from '../ui/FloatingText';
import { CombatLog } from '../ui/CombatLog';
import { TurnIndicator } from '../ui/TurnIndicator';
import { ParticleSystem } from '../systems/ParticleSystem';
import { SoundManager } from '../systems/SoundManager';
import { WorldItemEntity } from '../entities/WorldItem';
import { ItemDatabase } from '../systems/ItemDatabase';
import { InventoryManager } from '../systems/InventoryManager';
import { InventoryUI } from '../ui/InventoryUI';
import { DungeonGenerator } from '../systems/DungeonGenerator';
import { CharacterClass, ItemType, ItemCategory, GameState, RoomData, RoomType, PirateClass } from '../types';
import { MetaProgressionManager } from '../systems/MetaProgressionManager';
import { SpriteGenerator } from '../systems/SpriteGenerator';
import { SessionStateManager } from '../systems/SessionStateManager';
import { CurseInsightPanel } from '../ui/CurseInsightPanel';
import { LoreManager } from '../systems/LoreManager';
import { StoryEventSystem, StoryEvent, StoryEventOption } from '../systems/StoryEventSystem';
import { DialogueSystem, NPCType } from '../systems/DialogueSystem';
import { LoreUI, JournalUI } from '../ui/LoreUI';
import { DialogueUI } from '../ui/DialogueUI';
import { StoryEventUI } from '../ui/StoryEventUI';

export class GameScene extends Phaser.Scene {
  private map: number[][] = [];
  private rooms: RoomData[] = [];
  private gridManager!: GridManager;
  private graphics!: Phaser.GameObjects.Graphics;
  private player: Player | null = null;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  private wasdKeys: { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key } | undefined;
  private numberKeys: Phaser.Input.Keyboard.Key[] = [];
  private enemies: Enemy[] = [];
  private turnManager: TurnManager | null = null;
  private gameOverText: Phaser.GameObjects.Text | null = null;
  private playerStatusPanel: Phaser.GameObjects.Graphics | null = null;
  private playerStatusText: Phaser.GameObjects.Text | null = null;
  private runCounterText: Phaser.GameObjects.Text | null = null;
  private combatLog: CombatLog | null = null;
  private turnIndicator: TurnIndicator | null = null;
  private soundManager: SoundManager | null = null;
  private worldItems: WorldItemEntity[] = [];
  private inventoryManager: InventoryManager | null = null;
  private inventoryUI: InventoryUI | null = null;
  private gameState: GameState = GameState.NORMAL;
  private meta: MetaProgressionManager | null = null;
  private returnKey: Phaser.Input.Keyboard.Key | null = null;
  private runFinalized: boolean = false;
  private runKills: number = 0;
  private runCurrencyEarned: number = 0;
  private runComplete: boolean = false;
  private endScreenPanel: Phaser.GameObjects.Graphics | null = null;
  // Targeting system properties
  private targetingSlotIndex: number = -1;
  private targetingItemType: ItemType | null = null;
  private targetCursorSprite: Phaser.GameObjects.Sprite | null = null;
  private targetedEnemyIndex: number = 0;
  
  // Pirate theme systems
  private spriteGenerator: SpriteGenerator | null = null;
  private session: SessionStateManager | null = null;
  private curseInsightPanel: CurseInsightPanel | null = null;
  private tileSprites: Phaser.GameObjects.Sprite[] = [];
  
  // Story systems
  private loreManager: LoreManager | null = null;
  private storyEventSystem: StoryEventSystem | null = null;
  private dialogueSystem: DialogueSystem | null = null;
  private loreUI: LoreUI | null = null;
  private journalUI: JournalUI | null = null;
  private dialogueUI: DialogueUI | null = null;
  private storyEventUI: StoryEventUI | null = null;
  private journalKey: Phaser.Input.Keyboard.Key | null = null;
  private roomsExplored: Set<number> = new Set();
  private pendingStoryEvent: boolean = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  /**
   * Reset all state when scene starts/restarts
   */
  init(): void {
    // Reset all state for fresh run
    this.map = [];
    this.rooms = [];
    this.player = null;
    this.cursors = undefined;
    this.wasdKeys = undefined;
    this.numberKeys = [];
    this.enemies = [];
    this.turnManager = null;
    this.gameOverText = null;
    this.playerStatusPanel = null;
    this.playerStatusText = null;
    this.runCounterText = null;
    this.combatLog = null;
    this.turnIndicator = null;
    this.soundManager = null;
    this.worldItems = [];
    this.inventoryManager = null;
    this.inventoryUI = null;
    this.gameState = GameState.NORMAL;
    this.meta = null;
    this.returnKey = null;
    this.runFinalized = false;
    this.runKills = 0;
    this.runCurrencyEarned = 0;
    this.runComplete = false;
    this.endScreenPanel = null;
    this.targetingSlotIndex = -1;
    this.targetingItemType = null;
    this.targetCursorSprite = null;
    this.targetedEnemyIndex = 0;
    
    // Pirate systems
    this.spriteGenerator = null;
    this.session = null;
    this.curseInsightPanel = null;
    this.tileSprites = [];
    
    // Story systems
    this.loreManager = null;
    this.storyEventSystem = null;
    this.dialogueSystem = null;
    this.loreUI = null;
    this.journalUI = null;
    this.dialogueUI = null;
    this.storyEventUI = null;
    this.journalKey = null;
    this.roomsExplored = new Set();
    this.pendingStoryEvent = false;
  }

  preload(): void {
    // Sprites are generated programmatically in create()
  }

  create(): void {
    // Remove any existing keyboard listeners from previous runs
    this.input.keyboard?.removeAllKeys(true);

    // Generate all pirate-themed sprites
    this.spriteGenerator = new SpriteGenerator(this);
    this.spriteGenerator.generateAll();
    this.spriteGenerator.generateEntityTexture();  // Fallback

    // Initialize grid manager (25x18 tiles for 800x600 canvas)
    this.gridManager = new GridManager(25, 18);

    // Initialize meta-progression (persistent) and mark run start
    this.meta = MetaProgressionManager.getInstance();
    this.meta.markRunStarted();
    
    // Initialize session state (per-run)
    this.session = SessionStateManager.getInstance();
    // Map old CharacterClass to PirateClass for now
    const classMapping: Record<CharacterClass, PirateClass> = {
      [CharacterClass.WARRIOR]: PirateClass.DUELIST,
      [CharacterClass.ROGUE]: PirateClass.NAVIGATOR,
      [CharacterClass.GUARDIAN]: PirateClass.QUARTERMASTER
    };
    const pirateClass = classMapping[this.meta.getSelectedClass()] || PirateClass.DUELIST;
    this.session.startNewRun(pirateClass);

    // Generate dungeon with metadata extraction
    const dungeonGen = new DungeonGenerator();
    const { map, rooms } = dungeonGen.generate(25, 18);
    this.map = map;
    this.rooms = rooms;

    // Log room data for verification
    console.log(`Generated ${rooms.length} rooms:`, rooms.map(r => ({
      type: ['START', 'NORMAL', 'BOSS', 'TREASURE', 'CHALLENGE'][r.type],
      theme: ['DUNGEON', 'CAVE', 'CRYPT', 'LIBRARY'][r.theme],
      difficulty: r.difficulty
    })));

    // Initialize graphics for rendering
    this.graphics = this.add.graphics();

    // Render the dungeon
    this.renderMap();

    // Find starting position (first floor tile)
    let startX = 0;
    let startY = 0;
    outerLoop: for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        if (this.map[y][x] === 0) {
          startX = x;
          startY = y;
          break outerLoop;
        }
      }
    }

    // Create player with class-specific sprite
    const startingStats = this.meta.getStartingPlayerStats();
    const playerColor = this.getClassColor(this.meta.getSelectedClass());
    const playerPirateClass = this.session ? this.session.getPirateClass() : PirateClass.DUELIST;
    this.player = new Player(this, startX, startY, startingStats, playerColor, playerPirateClass);
    this.player.updateSpritePosition(this.gridManager);

    // Setup status effect callbacks for player
    this.player.statusManager.onDamage = (damage: number) => {
      if (this.player) {
        FloatingText.create(
          this,
          this.player.sprite.x,
          this.player.sprite.y - 30,
          `-${damage}`,
          '#ff6600' // Orange for DoT damage
        );
        if (this.combatLog) {
          this.combatLog.addEntry(`Status deals ${damage} dmg to you`);
        }
      }
    };

    this.player.statusManager.onHeal = (heal: number) => {
      if (this.player) {
        FloatingText.create(
          this,
          this.player.sprite.x,
          this.player.sprite.y - 30,
          `+${heal}`,
          '#00ff00' // Green for healing
        );
        if (this.combatLog) {
          this.combatLog.addEntry(`You heal ${heal} HP`);
        }
      }
    };

    // Create turn manager
    this.turnManager = new TurnManager();

    // Spawn 3-5 enemies randomly on floor tiles
    const numEnemies = Phaser.Math.Between(3, 5);
    for (let i = 0; i < numEnemies; i++) {
      // Find random floor tile not occupied by player
      let enemyX = 0;
      let enemyY = 0;
      let attempts = 0;
      while (attempts < 100) {
        enemyX = Phaser.Math.Between(0, this.map[0].length - 1);
        enemyY = Phaser.Math.Between(0, this.map.length - 1);

        // Check if floor tile and not player position
        if (this.map[enemyY][enemyX] === 0 &&
            (enemyX !== this.player.gridX || enemyY !== this.player.gridY)) {
          break;
        }
        attempts++;
      }

      // Find which room this position belongs to
      const room = this.rooms.find(r =>
        enemyX >= r.x && enemyX < r.x + r.width &&
        enemyY >= r.y && enemyY < r.y + r.height
      );

      // Skip enemy spawning in START and TREASURE rooms (safe zones)
      if (room && (room.type === RoomType.START || room.type === RoomType.TREASURE)) {
        continue;
      }

      // Determine enemy type based on room type
      let enemyType: number;
      if (room && room.type === RoomType.BOSS) {
        // Boss room: 70% chance of Brute
        enemyType = Math.random() < 0.7 ? 2 : Phaser.Math.Between(0, 2);
      } else {
        // Normal rooms: random enemy type
        enemyType = Phaser.Math.Between(0, 2);
      }

      let enemy: Enemy;
      if (enemyType === 0) {
        enemy = new Goblin(this, enemyX, enemyY);
      } else if (enemyType === 1) {
        enemy = new Archer(this, enemyX, enemyY);
      } else {
        enemy = new Brute(this, enemyX, enemyY);
      }

      enemy.updateSpritePosition(this.gridManager);

      // For CHALLENGE rooms, try to spawn an additional enemy
      if (room && room.type === RoomType.CHALLENGE && Math.random() < 0.5) {
        // Find another position in the same room
        let challengeX = 0;
        let challengeY = 0;
        let challengeAttempts = 0;
        while (challengeAttempts < 50) {
          challengeX = Phaser.Math.Between(room.x, room.x + room.width - 1);
          challengeY = Phaser.Math.Between(room.y, room.y + room.height - 1);

          // Check if floor tile and not occupied
          if (this.map[challengeY][challengeX] === 0 &&
              (challengeX !== this.player.gridX || challengeY !== this.player.gridY) &&
              (challengeX !== enemyX || challengeY !== enemyY)) {
            // Create second enemy for challenge room
            const challengeType = Phaser.Math.Between(0, 2);
            let challengeEnemy: Enemy;
            if (challengeType === 0) {
              challengeEnemy = new Goblin(this, challengeX, challengeY);
            } else if (challengeType === 1) {
              challengeEnemy = new Archer(this, challengeX, challengeY);
            } else {
              challengeEnemy = new Brute(this, challengeX, challengeY);
            }
            challengeEnemy.updateSpritePosition(this.gridManager);

            // Setup status callbacks for challenge enemy
            challengeEnemy.statusManager.onDamage = (damage: number) => {
              FloatingText.create(
                this,
                challengeEnemy.sprite.x,
                challengeEnemy.sprite.y - 30,
                `-${damage}`,
                '#ff6600'
              );
            };
            challengeEnemy.statusManager.onHeal = (heal: number) => {
              FloatingText.create(
                this,
                challengeEnemy.sprite.x,
                challengeEnemy.sprite.y - 30,
                `+${heal}`,
                '#00ff00'
              );
            };
            this.enemies.push(challengeEnemy);
            break;
          }
          challengeAttempts++;
        }
      }

      // Setup status effect callbacks for enemy
      enemy.statusManager.onDamage = (damage: number) => {
        FloatingText.create(
          this,
          enemy.sprite.x,
          enemy.sprite.y - 30,
          `-${damage}`,
          '#ff6600' // Orange for DoT damage
        );
      };

      enemy.statusManager.onHeal = (heal: number) => {
        FloatingText.create(
          this,
          enemy.sprite.x,
          enemy.sprite.y - 30,
          `+${heal}`,
          '#00ff00' // Green for healing
        );
      };

      this.enemies.push(enemy);
      this.turnManager.addEnemy(enemy);
    }

    // Create inventory manager
    this.inventoryManager = new InventoryManager();

    // Spawn 3-5 items randomly on floor tiles
    const numItems = Phaser.Math.Between(3, 5);
    for (let i = 0; i < numItems; i++) {
      let itemX = 0;
      let itemY = 0;
      let attempts = 0;

      // Find random unoccupied floor tile
      while (attempts < 100) {
        itemX = Phaser.Math.Between(0, this.map[0].length - 1);
        itemY = Phaser.Math.Between(0, this.map.length - 1);

        // Check if floor tile, not player, not enemy, not other item
        const occupied = (itemX === this.player.gridX && itemY === this.player.gridY) ||
                         this.enemies.some(e => e.gridX === itemX && e.gridY === itemY) ||
                         this.worldItems.some(item => item.gridX === itemX && item.gridY === itemY);

        if (this.map[itemY][itemX] === 0 && !occupied) {
          break;
        }
        attempts++;
      }

      // Find which room this position belongs to
      const itemRoom = this.rooms.find(r =>
        itemX >= r.x && itemX < r.x + r.width &&
        itemY >= r.y && itemY < r.y + r.height
      );

      // Skip item spawning in BOSS rooms (no easy healing)
      if (itemRoom && itemRoom.type === RoomType.BOSS) {
        continue;
      }

      // Determine item spawning based on room type
      if (itemRoom && itemRoom.type === RoomType.TREASURE) {
        // TREASURE room: spawn 2-3 items with health/buff bias
        const treasureCount = Phaser.Math.Between(2, 3);
        for (let j = 0; j < treasureCount; j++) {
          // Try to find a position in this room
          let treasureX = itemX;
          let treasureY = itemY;
          if (j > 0) {
            // For additional items, find new position in same room
            let treasureAttempts = 0;
            while (treasureAttempts < 50) {
              treasureX = Phaser.Math.Between(itemRoom.x, itemRoom.x + itemRoom.width - 1);
              treasureY = Phaser.Math.Between(itemRoom.y, itemRoom.y + itemRoom.height - 1);

              const treasureOccupied = (treasureX === this.player.gridX && treasureY === this.player.gridY) ||
                                       this.enemies.some(e => e.gridX === treasureX && e.gridY === treasureY) ||
                                       this.worldItems.some(item => item.gridX === treasureX && item.gridY === treasureY);

              if (this.map[treasureY][treasureX] === 0 && !treasureOccupied) {
                break;
              }
              treasureAttempts++;
            }
          }

          // 70% chance of health/buff potions in treasure rooms
          let treasureItemType: ItemType;
          if (Math.random() < 0.7) {
            const healthBuffTypes = [
              ItemType.HEALTH_POTION,
              ItemType.STRENGTH_POTION,
              ItemType.DEFENSE_POTION
            ];
            treasureItemType = healthBuffTypes[Math.floor(Math.random() * healthBuffTypes.length)];
          } else {
            treasureItemType = ItemDatabase.getRandomItemTypeWithFilter(
              (t) => this.meta ? this.meta.isItemUnlocked(t) : true
            );
          }

          const treasureItem = new WorldItemEntity(this, treasureX, treasureY, treasureItemType);
          treasureItem.updateSpritePosition(this.gridManager);
          this.worldItems.push(treasureItem);
        }
      } else if (itemRoom && itemRoom.type === RoomType.CHALLENGE) {
        // CHALLENGE room: spawn throwable items (bombs)
        const bombTypes = [ItemType.POISON_BOMB, ItemType.FIRE_BOMB]
          .filter(t => this.meta ? this.meta.isItemUnlocked(t) : true);
        const bombPool = bombTypes.length ? bombTypes : [ItemType.POISON_BOMB];
        const bombType = bombPool[Math.floor(Math.random() * bombPool.length)];
        const challengeItem = new WorldItemEntity(this, itemX, itemY, bombType);
        challengeItem.updateSpritePosition(this.gridManager);
        this.worldItems.push(challengeItem);
      } else {
        // Normal rooms: random item type
        const itemType = ItemDatabase.getRandomItemTypeWithFilter(
          (t) => this.meta ? this.meta.isItemUnlocked(t) : true
        );
        const worldItem = new WorldItemEntity(this, itemX, itemY, itemType);
        worldItem.updateSpritePosition(this.gridManager);
        this.worldItems.push(worldItem);
      }
    }

    // Setup keyboard input
    this.cursors = this.input.keyboard?.createCursorKeys();
    if (this.input.keyboard) {
      this.wasdKeys = this.input.keyboard.addKeys({
        W: Phaser.Input.Keyboard.KeyCodes.W,
        A: Phaser.Input.Keyboard.KeyCodes.A,
        S: Phaser.Input.Keyboard.KeyCodes.S,
        D: Phaser.Input.Keyboard.KeyCodes.D
      }) as { W: Phaser.Input.Keyboard.Key; A: Phaser.Input.Keyboard.Key; S: Phaser.Input.Keyboard.Key; D: Phaser.Input.Keyboard.Key };

      // Add number keys 1-5 for item usage
      this.numberKeys = [
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
        this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE)
      ];

      // Return to hub key
      this.returnKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R);
    }

    // Create player status panel (top-left UI)
    this.playerStatusPanel = this.add.graphics();
    this.playerStatusPanel.setDepth(500); // Always on top
    this.playerStatusPanel.fillStyle(0x000000, 0.7);
    this.playerStatusPanel.fillRect(10, 10, 200, 80);
    this.playerStatusPanel.lineStyle(2, 0xffffff);
    this.playerStatusPanel.strokeRect(10, 10, 200, 80);

    this.playerStatusText = this.add.text(20, 20, '', {
      fontSize: '14px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    this.playerStatusText.setDepth(501);

    // Run counter (show which run this is)
    const runNumber = this.meta.getLifetime().runsStarted;
    this.runCounterText = this.add.text(20, 75, `Run #${runNumber}`, {
      fontSize: '12px',
      color: '#888888'
    });
    this.runCounterText.setDepth(501);

    // Create combat log (bottom-right)
    this.combatLog = new CombatLog(this, 590, 480, 200, 110);
    this.combatLog.addEntry('Your turn');

    // Create turn indicator (top-center)
    this.turnIndicator = new TurnIndicator(this, 400, 20);
    
    // Create curse/insight panel (top-right)
    this.curseInsightPanel = new CurseInsightPanel(this, 610, 95);
    if (this.session) {
      this.curseInsightPanel.update(this.session.getCurse(), this.session.getInsight());
    }

    // Subscribe to turn change events
    this.turnManager.onTurnChange = (isPlayerTurn: boolean) => {
      if (this.turnIndicator) {
        if (isPlayerTurn) {
          this.turnIndicator.setPlayerTurn();
        } else {
          this.turnIndicator.setEnemyTurn();
        }
      }
    };

    // Create inventory UI (bottom-left)
    this.inventoryUI = new InventoryUI(this, 10, 530, this.inventoryManager);

    // Create sound manager
    this.soundManager = new SoundManager();
    
    // Initialize story systems
    this.loreManager = LoreManager.getInstance();
    this.storyEventSystem = new StoryEventSystem();
    this.dialogueSystem = new DialogueSystem();
    
    // Create story UIs
    this.loreUI = new LoreUI(this);
    this.journalUI = new JournalUI(this);
    this.dialogueUI = new DialogueUI(this);
    this.storyEventUI = new StoryEventUI(this);
    
    // Journal key (J)
    this.journalKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.J) || null;
    
    // Log story system initialization
    console.log('[STORY] Story systems initialized');
    console.log(`[STORY] Discovered lore: ${this.meta.getDiscoveredLoreCount()} entries`);
  }

  private renderMap(): void {
    this.graphics.clear();
    
    // Clear old tile sprites
    this.tileSprites.forEach(sprite => sprite.destroy());
    this.tileSprites = [];

    // Loop through map array and render tiles with sprites
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        const pixelPos = this.gridManager.gridToPixel({ x, y });
        
        // Determine tile texture based on type and room
        let textureKey = 'tile_floor';
        
        if (this.map[y][x] === 1) {
          textureKey = 'tile_wall';
        } else {
          // Check if this is a special room tile
          const room = this.rooms.find(r =>
            x >= r.x && x < r.x + r.width &&
            y >= r.y && y < r.y + r.height
          );
          
          if (room) {
            // Special visuals for different room types
            if (room.type === RoomType.TREASURE) {
              // Treasure rooms have slightly golden tint
              textureKey = 'tile_floor';
            } else if (room.type === RoomType.BOSS) {
              // Boss rooms - darker floor
              textureKey = 'tile_floor';
            }
          }
        }
        
        // Create tile sprite
        const tileSprite = this.add.sprite(pixelPos.x, pixelPos.y, textureKey);
        tileSprite.setDepth(0);
        
        // Add room-based tinting
        const room = this.rooms.find(r =>
          x >= r.x && x < r.x + r.width &&
          y >= r.y && y < r.y + r.height
        );
        
        if (room && this.map[y][x] === 0) {
          switch (room.type) {
            case RoomType.START:
              tileSprite.setTint(0x88aa88);  // Greenish safe zone
              break;
            case RoomType.TREASURE:
              tileSprite.setTint(0xaaaa77);  // Golden
              break;
            case RoomType.BOSS:
              tileSprite.setTint(0xaa6666);  // Reddish danger
              break;
            case RoomType.CHALLENGE:
              tileSprite.setTint(0x8888aa);  // Bluish
              break;
          }
        }
        
        this.tileSprites.push(tileSprite);
      }
    }
    
    // Add atmospheric overlay based on curse level
    if (this.session) {
      const curseStage = this.session.getCurse().getStage();
      if (curseStage >= 3) {
        // Add darkness/vignette effect at high curse
        const vignette = this.add.graphics();
        vignette.setDepth(5);
        const alpha = (curseStage - 2) * 0.05;
        vignette.fillStyle(0x330033, alpha);
        vignette.fillRect(0, 0, 800, 600);
      }
    }
  }

  update(): void {
    if (!this.player || !this.cursors || !this.turnManager) return;

    // Update player status panel
    if (this.playerStatusText && this.player) {
      this.playerStatusText.setText(
        `HP: ${this.player.stats.currentHP}/${this.player.stats.maxHP}\n` +
        `ATK: ${this.player.stats.attack}\n` +
        `DEF: ${this.player.stats.defense}`
      );
    }
    
    // Update curse/insight panel
    if (this.curseInsightPanel && this.session) {
      this.curseInsightPanel.update(this.session.getCurse(), this.session.getInsight());
    }
    
    // Block input while story UI is showing
    if (this.isStoryUIActive()) {
      // Only allow journal toggle when journal is open
      if (this.journalKey && Phaser.Input.Keyboard.JustDown(this.journalKey)) {
        if (this.journalUI?.isShowing()) {
          this.journalUI.hide();
        }
      }
      return;
    }
    
    // Journal toggle (J key)
    if (this.journalKey && Phaser.Input.Keyboard.JustDown(this.journalKey)) {
      this.journalUI?.toggle();
      return;
    }

    // Check if run is complete (death or victory)
    if (this.runComplete) {
      // Return to hub
      if (this.returnKey && Phaser.Input.Keyboard.JustDown(this.returnKey)) {
        this.scene.start('HubScene');
      }
      return; // Stop accepting input
    }

    // Check if player is dead
    if (!this.player.isAlive()) {
      this.showEndScreen(false);
      return;
    }

    // Check victory (all enemies killed)
    if (this.enemies.length === 0 && !this.runComplete) {
      this.showEndScreen(true);
      return;
    }

    // Only allow input during player turn
    if (!this.turnManager.isPlayerTurn()) return;

    // Handle targeting mode input (blocks normal input)
    if (this.gameState === GameState.TARGETING) {
      // Arrow keys cycle through enemies
      if (Phaser.Input.Keyboard.JustDown(this.cursors.left) ||
          (this.wasdKeys && Phaser.Input.Keyboard.JustDown(this.wasdKeys.A))) {
        this.targetPreviousEnemy();
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) ||
                 (this.wasdKeys && Phaser.Input.Keyboard.JustDown(this.wasdKeys.D))) {
        this.targetNextEnemy();
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
                 (this.wasdKeys && Phaser.Input.Keyboard.JustDown(this.wasdKeys.W))) {
        this.targetPreviousEnemy();
      } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
                 (this.wasdKeys && Phaser.Input.Keyboard.JustDown(this.wasdKeys.S))) {
        this.targetNextEnemy();
      }

      // Enter key confirms throw
      if (this.input.keyboard) {
        const enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        if (Phaser.Input.Keyboard.JustDown(enterKey)) {
          this.confirmThrow();
          return;
        }

        // Escape key cancels targeting
        const escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
        if (Phaser.Input.Keyboard.JustDown(escKey)) {
          this.cancelTargeting();
        }
      }

      return;  // Block normal input during targeting
    }

    let playerMoved = false;

    // Check for arrow key or WASD input using JustDown to prevent repeat firing
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
        (this.wasdKeys && Phaser.Input.Keyboard.JustDown(this.wasdKeys.W))) {
      playerMoved = this.handlePlayerMove(0, -1);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down) ||
               (this.wasdKeys && Phaser.Input.Keyboard.JustDown(this.wasdKeys.S))) {
      playerMoved = this.handlePlayerMove(0, 1);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.left) ||
               (this.wasdKeys && Phaser.Input.Keyboard.JustDown(this.wasdKeys.A))) {
      playerMoved = this.handlePlayerMove(-1, 0);
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right) ||
               (this.wasdKeys && Phaser.Input.Keyboard.JustDown(this.wasdKeys.D))) {
      playerMoved = this.handlePlayerMove(1, 0);
    }

    // Check for item usage (number keys 1-5)
    if (!playerMoved) {
      for (let i = 0; i < this.numberKeys.length; i++) {
        if (Phaser.Input.Keyboard.JustDown(this.numberKeys[i])) {
          if (this.handleItemUsage(i)) {
            playerMoved = true;  // Item usage costs a turn
            break;  // Only one item per turn
          }
        }
      }
    }

    // If player successfully moved, end player turn
    if (playerMoved) {
      // Check for room exploration events
      this.checkRoomExploration();
      
      // Track player HP before enemy turn
      const playerHPBefore = this.player.stats.currentHP;
      const playerXBefore = this.player.sprite.x;
      const playerYBefore = this.player.sprite.y;

      // Manually switch turn indicator to enemy turn
      if (this.turnIndicator) {
        this.turnIndicator.setEnemyTurn();
      }

      // Log enemy turn start
      if (this.combatLog) {
        this.combatLog.addEntry('Enemies acting...');
      }

      // Add delay before enemy turn so player can see the indicator
      this.time.delayedCall(400, () => {
        if (!this.player || !this.turnManager) return;

        this.turnManager.endPlayerTurn(this.player, this.map, this.gridManager);

        // Show damage number if player took damage during enemy turn
        const playerHPAfter = this.player.stats.currentHP;
        if (playerHPAfter < playerHPBefore) {
          const damageTaken = playerHPBefore - playerHPAfter;

          // Sound effect
          if (this.soundManager) {
            if (damageTaken >= 5) {
              this.soundManager.playHeavyHit();
            } else {
              this.soundManager.playHit();
            }
          }

          // Visual effects
          ParticleSystem.createHitSparks(this, playerXBefore, playerYBefore);
          ParticleSystem.createBloodBurst(this, playerXBefore, playerYBefore, damageTaken / 5);

          FloatingText.create(
            this,
            playerXBefore,
            playerYBefore - 30,
            `-${damageTaken}`,
            '#ff0000' // Red for player damage
          );
          // Log enemy damage to player
          if (this.combatLog) {
            this.combatLog.addEntry(`Enemy hits you for ${damageTaken} dmg`);
          }
        }

        // Remove dead enemies after enemy turn
        for (let i = this.enemies.length - 1; i >= 0; i--) {
          const enemy = this.enemies[i];
          if (!enemy.isAlive()) {
            const enemyName = this.getEnemyName(enemy);

            // Sound effect
            if (this.soundManager) {
              this.soundManager.playDeath();
            }

            // Death explosion particle effect
            ParticleSystem.createDeathExplosion(this, enemy.sprite.x, enemy.sprite.y, enemy.sprite.tintTopLeft);

            if (this.combatLog) {
              this.combatLog.addEntry(`${enemyName} defeated!`);
            }
            this.awardMetaForEnemy(enemy);
            enemy.sprite.destroy();
            this.enemies.splice(i, 1);
          }
        }

        // Log player turn start
        if (this.combatLog) {
          this.combatLog.addEntry('Your turn');
        }
      });
    }
  }

  private handlePlayerMove(dx: number, dy: number): boolean {
    if (!this.player) return false;

    const newX = this.player.gridX + dx;
    const newY = this.player.gridY + dy;

    // Check if target position has an enemy
    const targetEnemy = this.enemies.find(e => e.gridX === newX && e.gridY === newY && e.isAlive());

    if (targetEnemy) {
      // Attack the enemy
      const damage = this.player.attack(targetEnemy);

      // Sound effect
      if (this.soundManager) {
        if (damage >= 5) {
          this.soundManager.playHeavyHit();
        } else {
          this.soundManager.playHit();
        }
      }

      // Visual effects
      ParticleSystem.createHitSparks(this, targetEnemy.sprite.x, targetEnemy.sprite.y);
      ParticleSystem.createBloodBurst(this, targetEnemy.sprite.x, targetEnemy.sprite.y, damage / 5);

      // Show damage number
      FloatingText.create(
        this,
        targetEnemy.sprite.x,
        targetEnemy.sprite.y - 30,
        `-${damage}`,
        '#ffaa00' // Yellow for enemy damage
      );

      // Log the attack
      const enemyName = this.getEnemyName(targetEnemy);
      if (this.combatLog) {
        this.combatLog.addEntry(`You hit ${enemyName} for ${damage} dmg`);
      }
      return true; // Count as a successful action
    } else {
      // Try to move
      if (this.player.move(dx, dy, this.map)) {
        this.player.updateSpritePosition(this.gridManager);
        this.checkItemPickup();  // Check for items at new position
        return true;
      }
    }

    return false;
  }

  /**
   * Check if player is standing on an item and pick it up
   */
  private checkItemPickup(): void {
    if (!this.player || !this.inventoryManager) return;

    // Find item at player position
    const itemIndex = this.worldItems.findIndex(
      item => item.gridX === this.player!.gridX && item.gridY === this.player!.gridY
    );

    if (itemIndex === -1) return;  // No item at position

    const worldItem = this.worldItems[itemIndex];
    const itemType = worldItem.itemType;
    const definition = ItemDatabase.getDefinition(itemType);

    // Try to add to inventory
    if (this.inventoryManager.addItem(itemType)) {
      // Pickup successful
      if (this.combatLog) {
        this.combatLog.addEntry(`Picked up ${definition.name}`);
      }

      // Visual feedback: floating text
      FloatingText.create(
        this,
        worldItem.sprite.x,
        worldItem.sprite.y,
        definition.name,
        '#ffff00'  // Yellow for pickups
      );

      // Remove from world
      worldItem.destroy();
      this.worldItems.splice(itemIndex, 1);
    } else {
      // Inventory full
      if (this.combatLog) {
        this.combatLog.addEntry('Inventory full!');
      }
    }
  }

  /**
   * Handle item usage from inventory slot
   * Returns true if usage successful (counts as turn action)
   */
  private handleItemUsage(slotIndex: number): boolean {
    if (!this.player || !this.inventoryManager) return false;
    if (this.gameState !== GameState.NORMAL) return false;  // Don't use during targeting

    // Check if slot has item
    if (!this.inventoryManager.hasItemInSlot(slotIndex)) {
      return false;  // Empty slot, no action
    }

    // Get item type before using (useItem removes it)
    const itemType = this.inventoryManager.getItemInSlot(slotIndex);
    if (itemType === null) return false;

    const definition = ItemDatabase.getDefinition(itemType);

    // Handle based on category
    switch (definition.category) {
      case ItemCategory.INSTANT_CONSUMABLE:
        return this.useInstantItem(slotIndex, definition);

      case ItemCategory.BUFF_CONSUMABLE:
        return this.useBuffItem(slotIndex, definition);

      case ItemCategory.THROWABLE:
        return this.startTargeting(slotIndex, itemType);
    }

    return false;
  }

  /**
   * Use instant consumable (health potion)
   */
  private useInstantItem(slotIndex: number, definition: any): boolean {
    if (!this.player || !this.inventoryManager) return false;

    // Consume item from inventory
    const itemType = this.inventoryManager.useItem(slotIndex);
    if (itemType === null) return false;

    // Apply healing
    if (definition.healAmount) {
      const healAmount = Math.min(
        definition.healAmount,
        this.player.stats.maxHP - this.player.stats.currentHP
      );

      this.player.stats.currentHP += healAmount;

      // Visual feedback
      FloatingText.create(
        this,
        this.player.sprite.x,
        this.player.sprite.y - 30,
        `+${healAmount}`,
        '#00ff00'  // Green for healing
      );

      ParticleSystem.createHealSparkle(this, this.player.sprite.x, this.player.sprite.y);

      // Combat log
      if (this.combatLog) {
        this.combatLog.addEntry(`Used ${definition.name} - healed ${healAmount} HP`);
      }
    }

    return true;  // Successful usage, costs turn
  }

  /**
   * Use buff consumable (strength/defense potion)
   */
  private useBuffItem(slotIndex: number, definition: any): boolean {
    if (!this.player || !this.inventoryManager) return false;

    // Consume item from inventory
    const itemType = this.inventoryManager.useItem(slotIndex);
    if (itemType === null) return false;

    // Apply buff status effect
    if (definition.buffType && definition.buffDuration && definition.buffPotency) {
      this.player.statusManager.applyEffect({
        type: definition.buffType,
        duration: definition.buffDuration,
        potency: definition.buffPotency,
        stacks: 1
      });

      this.player.updateStatusIcons();

      // Visual feedback
      const buffColor = definition.buffType === 9  // STRENGTH_BUFF
        ? '#ff6600'  // Orange
        : '#0088ff';  // Blue

      FloatingText.create(
        this,
        this.player.sprite.x,
        this.player.sprite.y - 30,
        definition.name,
        buffColor
      );

      // Particle effect
      ParticleSystem.createHealSparkle(this, this.player.sprite.x, this.player.sprite.y);

      // Combat log
      if (this.combatLog) {
        const buffName = definition.buffType === 9  // STRENGTH_BUFF
          ? 'Strength'
          : 'Defense';
        this.combatLog.addEntry(`Used ${definition.name} - gained ${buffName} buff`);
      }
    }

    return true;  // Successful usage, costs turn
  }

  /**
   * Start targeting mode for throwable items
   * Returns false since targeting doesn't cost a turn until confirmed
   */
  private startTargeting(slotIndex: number, itemType: ItemType): boolean {
    // Check if there are any enemies to target
    if (this.enemies.length === 0) {
      if (this.combatLog) {
        this.combatLog.addEntry('No enemies to target!');
      }
      return false;
    }

    // Enter targeting mode
    this.gameState = GameState.TARGETING;
    this.targetingSlotIndex = slotIndex;
    this.targetingItemType = itemType;
    this.targetedEnemyIndex = 0;

    // Create cursor sprite on first enemy
    const firstEnemy = this.enemies[0];
    this.targetCursorSprite = this.add.sprite(
      firstEnemy.sprite.x,
      firstEnemy.sprite.y,
      'entity'
    );
    this.targetCursorSprite.setTint(0xffff00);  // Yellow
    this.targetCursorSprite.setScale(1.2);
    this.targetCursorSprite.setAlpha(0.5);
    this.targetCursorSprite.setDepth(150);  // Above entities

    // Pulsing animation
    this.tweens.add({
      targets: this.targetCursorSprite,
      scale: 1.4,
      alpha: 0.3,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Combat log instruction
    const definition = ItemDatabase.getDefinition(itemType);
    if (this.combatLog) {
      this.combatLog.addEntry(`Targeting ${definition.name} - arrows to select, Enter to throw, ESC to cancel`);
    }

    return false;  // Don't end turn yet
  }

  /**
   * Cycle to next enemy in targeting mode
   */
  private targetNextEnemy(): void {
    if (this.enemies.length === 0) return;

    this.targetedEnemyIndex = (this.targetedEnemyIndex + 1) % this.enemies.length;
    this.updateTargetCursor();
  }

  /**
   * Cycle to previous enemy in targeting mode
   */
  private targetPreviousEnemy(): void {
    if (this.enemies.length === 0) return;

    this.targetedEnemyIndex--;
    if (this.targetedEnemyIndex < 0) {
      this.targetedEnemyIndex = this.enemies.length - 1;
    }
    this.updateTargetCursor();
  }

  /**
   * Update cursor position to current target
   */
  private updateTargetCursor(): void {
    if (!this.targetCursorSprite || this.enemies.length === 0) return;

    const targetEnemy = this.enemies[this.targetedEnemyIndex];
    this.targetCursorSprite.setPosition(targetEnemy.sprite.x, targetEnemy.sprite.y);
  }

  /**
   * Confirm throw and apply effect to targeted enemy
   * This costs a turn
   */
  private confirmThrow(): void {
    if (!this.player || !this.inventoryManager || !this.targetingItemType) return;
    if (this.enemies.length === 0) return;

    const targetEnemy = this.enemies[this.targetedEnemyIndex];
    const definition = ItemDatabase.getDefinition(this.targetingItemType);

    // Consume item from inventory
    const itemType = this.inventoryManager.useItem(this.targetingSlotIndex);
    if (itemType === null) {
      this.cancelTargeting();
      return;
    }

    // Animate projectile from player to enemy
    this.animateProjectile(
      this.player.sprite.x,
      this.player.sprite.y,
      targetEnemy.sprite.x,
      targetEnemy.sprite.y,
      definition.iconColor,
      () => {
        // Apply status effect on impact
        if (definition.throwEffect && definition.throwPotency && definition.throwDuration) {
          targetEnemy.statusManager.applyEffect({
            type: definition.throwEffect,
            duration: definition.throwDuration,
            potency: definition.throwPotency,
            stacks: 1
          });

          targetEnemy.updateStatusIcons();

          // Visual effect on impact
          if (itemType === ItemType.POISON_BOMB) {
            ParticleSystem.createPoisonCloud(this, targetEnemy.sprite.x, targetEnemy.sprite.y);
          } else if (itemType === ItemType.FIRE_BOMB) {
            ParticleSystem.createFireBurst(this, targetEnemy.sprite.x, targetEnemy.sprite.y);
          }

          // Combat log
          const enemyName = this.getEnemyName(targetEnemy);
          const effectName = itemType === ItemType.POISON_BOMB ? 'Poisoned' : 'Burned';
          if (this.combatLog) {
            this.combatLog.addEntry(`Threw ${definition.name} at ${enemyName} - ${effectName}!`);
          }
        }
      }
    );

    // Cancel targeting mode
    this.cancelTargeting();

    // Trigger enemy turn (item usage costs turn)
    // Use delayed call to let projectile animation play
    this.time.delayedCall(400, () => {
      if (!this.player || !this.turnManager) return;

      const playerHPBefore = this.player.stats.currentHP;
      const playerXBefore = this.player.sprite.x;
      const playerYBefore = this.player.sprite.y;

      if (this.turnIndicator) {
        this.turnIndicator.setEnemyTurn();
      }

      if (this.combatLog) {
        this.combatLog.addEntry('Enemies acting...');
      }

      this.time.delayedCall(400, () => {
        if (!this.player || !this.turnManager) return;

        this.turnManager.endPlayerTurn(this.player, this.map, this.gridManager);

        const playerHPAfter = this.player.stats.currentHP;
        if (playerHPAfter < playerHPBefore) {
          const damageTaken = playerHPBefore - playerHPAfter;

          if (this.soundManager) {
            if (damageTaken >= 5) {
              this.soundManager.playHeavyHit();
            } else {
              this.soundManager.playHit();
            }
          }

          ParticleSystem.createHitSparks(this, playerXBefore, playerYBefore);
          ParticleSystem.createBloodBurst(this, playerXBefore, playerYBefore, damageTaken / 5);

          FloatingText.create(
            this,
            playerXBefore,
            playerYBefore - 30,
            `-${damageTaken}`,
            '#ff0000'
          );

          if (this.combatLog) {
            this.combatLog.addEntry(`Enemy hits you for ${damageTaken} dmg`);
          }
        }

        // Remove dead enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
          const enemy = this.enemies[i];
          if (!enemy.isAlive()) {
            const enemyName = this.getEnemyName(enemy);

            if (this.soundManager) {
              this.soundManager.playDeath();
            }

            ParticleSystem.createDeathExplosion(this, enemy.sprite.x, enemy.sprite.y, enemy.sprite.tintTopLeft);

            if (this.combatLog) {
              this.combatLog.addEntry(`${enemyName} defeated!`);
            }
            this.awardMetaForEnemy(enemy);
            enemy.sprite.destroy();
            this.enemies.splice(i, 1);
          }
        }

        if (this.combatLog) {
          this.combatLog.addEntry('Your turn');
        }
      });
    });
  }

  /**
   * Cancel targeting mode
   */
  private cancelTargeting(): void {
    this.gameState = GameState.NORMAL;
    this.targetingSlotIndex = -1;
    this.targetingItemType = null;
    this.targetedEnemyIndex = 0;

    if (this.targetCursorSprite) {
      this.targetCursorSprite.destroy();
      this.targetCursorSprite = null;
    }
  }

  /**
   * Animate projectile from start to end position
   */
  private animateProjectile(
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    color: number,
    onComplete: () => void
  ): void {
    // Create projectile sprite
    const projectile = this.add.sprite(startX, startY, 'entity');
    projectile.setTint(color);
    projectile.setScale(0.5);
    projectile.setDepth(200);  // Above everything

    // Tween to target
    this.tweens.add({
      targets: projectile,
      x: endX,
      y: endY,
      duration: 300,
      ease: 'Quad.easeOut',
      onComplete: () => {
        projectile.destroy();
        onComplete();
      }
    });
  }

  // --- Story System Methods ---
  
  /**
   * Check if any story UI is currently active
   */
  private isStoryUIActive(): boolean {
    return !!(
      this.loreUI?.isShowing() ||
      this.journalUI?.isShowing() ||
      this.dialogueUI?.isShowing() ||
      this.storyEventUI?.isShowing()
    );
  }
  
  /**
   * Check and trigger room exploration events
   */
  private checkRoomExploration(): void {
    if (!this.player || !this.session || !this.storyEventSystem) return;
    
    // Find current room
    const currentRoom = this.rooms.findIndex(r =>
      this.player!.gridX >= r.x && this.player!.gridX < r.x + r.width &&
      this.player!.gridY >= r.y && this.player!.gridY < r.y + r.height
    );
    
    if (currentRoom >= 0 && !this.roomsExplored.has(currentRoom)) {
      this.roomsExplored.add(currentRoom);
      
      // Roll for story event when entering new room
      this.rollForStoryEvent();
    }
  }
  
  /**
   * Roll for a random story event
   */
  private rollForStoryEvent(): void {
    if (!this.session || !this.storyEventSystem || this.pendingStoryEvent) return;
    
    const insight = this.session.getInsight().current;
    const paleAttention = this.meta?.getPaleAttention() || 0;
    const curseStage = this.session.getCurse().getState().stage;
    const playerClass = this.session.getPirateClass();
    
    const event = this.storyEventSystem.rollForEvent(
      insight,
      paleAttention,
      curseStage,
      playerClass,
      1, // Dungeon level (placeholder)
      0.2 // 20% base chance per new room
    );
    
    if (event) {
      this.pendingStoryEvent = true;
      // Slight delay before showing event
      this.time.delayedCall(500, () => {
        this.showStoryEvent(event);
      });
    }
  }
  
  /**
   * Show a story event
   */
  private showStoryEvent(event: StoryEvent): void {
    if (!this.storyEventUI || !this.session) return;
    
    console.log(`[STORY] Triggering event: ${event.title}`);
    
    this.storyEventUI.showEvent(event, (effects) => {
      this.applyStoryEffects(effects);
      this.storyEventSystem?.markTriggered(event.id);
      this.pendingStoryEvent = false;
    });
  }
  
  /**
   * Apply effects from a story event choice
   */
  private applyStoryEffects(effects: StoryEventOption['effects']): void {
    if (!this.session || !this.player) return;
    
    // Insight gain
    if (effects.insightGain) {
      this.session.getInsight().gain(effects.insightGain, 'story_event');
      this.curseInsightPanel?.showInsightGain(effects.insightGain);
      console.log(`[STORY] +${effects.insightGain} insight`);
    }
    
    // Pale Attention
    if (effects.paleAttentionGain && this.meta) {
      this.meta.addPaleAttention(effects.paleAttentionGain);
      console.log(`[STORY] +${effects.paleAttentionGain} pale attention`);
    }
    
    // Currency
    if (effects.currencyGain && this.meta) {
      this.meta.addCurrency(effects.currencyGain);
      this.runCurrencyEarned += effects.currencyGain;
      FloatingText.create(
        this,
        this.player.sprite.x,
        this.player.sprite.y - 40,
        `+${effects.currencyGain} 🪙`,
        '#ffd700'
      );
    }
    
    if (effects.currencyCost && this.meta) {
      this.meta.addCurrency(-effects.currencyCost);
    }
    
    // Health
    if (effects.healthGain) {
      this.player.stats.currentHP = Math.min(
        this.player.stats.maxHP,
        this.player.stats.currentHP + effects.healthGain
      );
      FloatingText.create(
        this,
        this.player.sprite.x,
        this.player.sprite.y - 40,
        `+${effects.healthGain} HP`,
        '#00ff00'
      );
    }
    
    if (effects.healthCost) {
      this.player.stats.currentHP -= effects.healthCost;
      FloatingText.create(
        this,
        this.player.sprite.x,
        this.player.sprite.y - 40,
        `-${effects.healthCost} HP`,
        '#ff4444'
      );
    }
    
    // Curse advance
    if (effects.curseAdvance) {
      // Partial day advancement to simulate curse progression
      const days = Math.ceil(effects.curseAdvance);
      this.session.advanceDay(days);
      this.curseInsightPanel?.showCurseIncrease();
    }
    
    // Reveal lore
    if (effects.revealLore && this.loreManager) {
      const insight = this.session.getInsight().current;
      const result = this.loreManager.discoverLore(effects.revealLore, insight);
      if (result) {
        console.log(`[STORY] Discovered lore: ${effects.revealLore}`);
        // Show lore notification
        FloatingText.create(
          this,
          400,
          100,
          '📜 New lore discovered!',
          '#c9a227'
        );
      }
    }
  }
  
  /**
   * Trigger an NPC dialogue
   */
  private triggerDialogue(npcType: NPCType): void {
    if (!this.dialogueUI || !this.session) return;
    
    const insight = this.session.getInsight().current;
    const paleAttention = this.meta?.getPaleAttention() || 0;
    const curseStage = this.session.getCurse().getState().stage;
    const playerClass = this.session.getPirateClass();
    
    this.dialogueUI.startDialogue(
      npcType,
      insight,
      paleAttention,
      curseStage,
      playerClass,
      () => {
        console.log('[DIALOGUE] Conversation ended');
      },
      (effects) => {
        if (effects) {
          this.applyStoryEffects(effects as any);
        }
      }
    );
  }

  private getEnemyName(enemy: Enemy): string {
    if (enemy instanceof Goblin) return 'Marine';
    if (enemy instanceof Archer) return 'Musketeer';
    if (enemy instanceof Brute) return 'Brute';
    return 'Pirate';
  }

  private getClassColor(cls: CharacterClass): number {
    switch (cls) {
      case CharacterClass.WARRIOR:
        return 0x00ff00; // Green
      case CharacterClass.ROGUE:
        return 0xffff00; // Yellow
      case CharacterClass.GUARDIAN:
        return 0x0088ff; // Blue
      default:
        return 0x00ff00;
    }
  }

  /**
   * Show end screen (death or victory)
   */
  private showEndScreen(victory: boolean): void {
    if (this.runComplete) return;
    this.runComplete = true;

    // Finalize run
    if (this.meta && !this.runFinalized) {
      this.runFinalized = true;
      this.meta.markRunEnded();

      // Victory bonus
      if (victory) {
        const bonus = 10;
        this.meta.addCurrency(bonus);
        this.runCurrencyEarned += bonus;
      }
    }

    // Create panel background
    this.endScreenPanel = this.add.graphics();
    this.endScreenPanel.setDepth(700);
    this.endScreenPanel.fillStyle(0x000000, 0.85);
    this.endScreenPanel.fillRoundedRect(200, 150, 400, 300, 16);
    this.endScreenPanel.lineStyle(3, victory ? 0x00ff00 : 0xff0000);
    this.endScreenPanel.strokeRoundedRect(200, 150, 400, 300, 16);

    // Title
    const title = victory ? 'DUNGEON CLEARED!' : 'RUN ENDED';
    const titleColor = victory ? '#00ff00' : '#ff0000';
    this.add.text(400, 190, title, {
      fontSize: '32px',
      color: titleColor,
      fontStyle: 'bold'
    }).setOrigin(0.5).setDepth(701);

    // Class played
    const className = this.meta ? this.meta.getClassName(this.meta.getSelectedClass()) : 'Unknown';
    this.add.text(400, 240, `Class: ${className}`, {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(701);

    // Stats
    this.add.text(400, 280, `Enemies Killed: ${this.runKills}`, {
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5).setDepth(701);

    // Currency earned
    const bonusText = victory ? ' (+10 bonus)' : '';
    this.add.text(400, 320, `Currency Earned: +${this.runCurrencyEarned}${bonusText}`, {
      fontSize: '18px',
      color: '#ffcc00'
    }).setOrigin(0.5).setDepth(701);

    // Return instruction
    this.add.text(400, 400, 'Press R to return to hub', {
      fontSize: '16px',
      color: '#888888'
    }).setOrigin(0.5).setDepth(701);

    // Fade in animation
    this.endScreenPanel.setAlpha(0);
    this.tweens.add({
      targets: this.endScreenPanel,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });
  }

  private awardMetaForEnemy(enemy: Enemy): void {
    if (!this.meta) return;
    let reward = 1;
    if (enemy instanceof Goblin) reward = 2;
    else if (enemy instanceof Archer) reward = 3;
    else if (enemy instanceof Brute) reward = 5;

    this.meta.addCurrency(reward);
    this.meta.recordEnemyKill();
    this.runKills += 1;
    this.runCurrencyEarned += reward;
    
    // Track in session for curse manifestation
    if (this.session) {
      this.session.recordKill();
      
      // Combat gives small insight (you're learning about threats)
      if (enemy instanceof Brute) {
        this.session.getInsight().gain(2, 'Defeated powerful foe');
      }
    }
  }

  /**
   * Debug method: Give item to player inventory
   * Usage in browser console: game.scene.scenes[0].giveItem(0) for health potion
   */
  giveItem(itemType: ItemType): void {
    if (!this.inventoryManager) return;

    const success = this.inventoryManager.addItem(itemType);
    const definition = ItemDatabase.getDefinition(itemType);

    if (success) {
      console.log(`Added ${definition.name} to inventory`);
    } else {
      console.log('Inventory full!');
    }
  }

  /**
   * Debug method: Spawn item at player position
   * Usage in browser console: game.scene.scenes[0].spawnItemAtPlayer(0)
   */
  spawnItemAtPlayer(itemType: ItemType): void {
    if (!this.player) return;

    const worldItem = new WorldItemEntity(this, this.player.gridX, this.player.gridY, itemType);
    worldItem.updateSpritePosition(this.gridManager);
    this.worldItems.push(worldItem);

    const definition = ItemDatabase.getDefinition(itemType);
    console.log(`Spawned ${definition.name} at player position`);
  }
}

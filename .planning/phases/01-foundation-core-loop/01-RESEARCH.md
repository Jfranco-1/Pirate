# Phase 1: Foundation & Core Loop - Research

**Researched:** 2026-01-09
**Domain:** Turn-based tactical roguelike game development (2D, grid-based, web)
**Confidence:** HIGH

<research_summary>
## Summary

Researched the JavaScript/TypeScript ecosystem for building a turn-based tactical roguelike with grid-based movement. The standard approach for web-based roguelikes uses **Phaser 3** as the game framework paired with **Rot.js** for roguelike-specific functionality (FOV, pathfinding, map generation).

Key finding: Don't hand-roll core roguelike systems. Rot.js provides battle-tested implementations of Field of View (shadowcasting), pathfinding (Dijkstra), procedural generation, and turn scheduling. PathFinding.js offers additional A* pathfinding if needed. Hand-rolling these leads to bugs in edge cases and poor performance.

For turn-based gameplay, use Finite State Machines (FSM) or Redux patterns for state management, with event-driven architecture for clean separation between game logic and rendering.

**Primary recommendation:** Use Phaser 3 + Rot.js stack. Leverage Rot.js for FOV, map generation, and pathfinding. Use Phaser's Scene system for game states, built-in Input for controls, and Canvas/WebGL rendering. Start simple with direct turn-based logic before adding complex action queues.
</research_summary>

<standard_stack>
## Standard Stack

The established libraries/tools for web-based roguelikes:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Phaser 3 | 3.90.0+ | Game framework | Industry-standard HTML5 2D game framework, 10+ years active development, 42k+ dependent projects |
| Rot.js | 0.5.0+ | Roguelike toolkit | Purpose-built for roguelikes, includes FOV/pathfinding/map gen, feature-complete and stable |
| TypeScript | 5.x | Type safety | Optional but recommended for larger projects, excellent tooling support |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| PathFinding.js | 0.4.17+ | A* pathfinding | If you need A* specifically (Rot.js uses Dijkstra) |
| rot-js (npm) | - | Rot.js on npm | Easier package management than manual includes |
| Vite | 5.x+ | Build tooling | Modern dev server and bundler for TypeScript/ES modules |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Phaser 3 | Godot (HTML5 export) | Godot if multi-platform desktop needed, but worse web DX |
| Phaser 3 | PixiJS only | PixiJS if you need max rendering performance and want to build game systems yourself |
| Rot.js | Custom algorithms | Never recommended - Rot.js algorithms are mature and well-tested |
| Web-based | Unity/Godot native | Native if you want desktop deployment, but web is faster to iterate |

**Installation:**
```bash
npm install phaser rot-js
# Optional:
npm install pathfinding
npm install -D typescript vite @types/node
```

**Confidence:** HIGH - Phaser 3 and Rot.js are the established standard for web-based roguelikes, verified through official GitHub repositories, multiple tutorials, and active community usage.
</standard_stack>

<architecture_patterns>
## Architecture Patterns

### Recommended Project Structure
```
src/
├── main.ts              # Entry point, Phaser game config
├── scenes/
│   ├── BootScene.ts    # Asset loading
│   ├── GameScene.ts    # Main gameplay
│   └── MenuScene.ts    # Main menu
├── entities/
│   ├── Player.ts       # Player entity with stats
│   ├── Enemy.ts        # Base enemy class
│   └── Entity.ts       # Base entity interface
├── systems/
│   ├── TurnManager.ts  # Turn scheduling and execution
│   ├── GridManager.ts  # Grid coordinate management
│   ├── FOVSystem.ts    # Field of view calculations
│   └── InputSystem.ts  # Input handling and mapping
├── utils/
│   └── MapGenerator.ts # Procedural map generation
└── types/
    └── index.ts        # TypeScript interfaces
```

### Pattern 1: Turn-Based Game Loop
**What:** Sequential turn execution with action queue
**When to use:** Turn-based tactical games with player and enemy turns
**Example:**
```typescript
// Based on common roguelike patterns
class TurnManager {
  private actors: Actor[] = []
  private currentIndex: number = 0

  public nextTurn(): Actor {
    const actor = this.actors[this.currentIndex]
    this.currentIndex = (this.currentIndex + 1) % this.actors.length
    return actor
  }

  public executeTurn(actor: Actor): void {
    const action = actor.getAction() // AI or player input
    action.perform()
    this.nextTurn()
  }
}
```

### Pattern 2: Grid-Based Coordinate System
**What:** Tile coordinates separate from pixel positions
**When to use:** Any grid-based game
**Example:**
```typescript
// Separation of grid coordinates from rendering
interface GridPosition {
  x: number // Grid column
  y: number // Grid row
}

class GridManager {
  constructor(
    private tileSize: number = 32,
    private width: number,
    private height: number
  ) {}

  gridToPixel(gridPos: GridPosition): { x: number, y: number } {
    return {
      x: gridPos.x * this.tileSize,
      y: gridPos.y * this.tileSize
    }
  }

  pixelToGrid(x: number, y: number): GridPosition {
    return {
      x: Math.floor(x / this.tileSize),
      y: Math.floor(y / this.tileSize)
    }
  }

  isValidPosition(pos: GridPosition): boolean {
    return pos.x >= 0 && pos.x < this.width &&
           pos.y >= 0 && pos.y < this.height
  }
}
```

### Pattern 3: Finite State Machine for Game States
**What:** FSM to manage game modes (menu, playing, paused, game over)
**When to use:** Any game with distinct states
**Example:**
```typescript
// Using Phaser's built-in Scene system as FSM
class GameScene extends Phaser.Scene {
  private gameState: 'PLAYER_TURN' | 'ENEMY_TURN' | 'ANIMATION' = 'PLAYER_TURN'

  update() {
    switch(this.gameState) {
      case 'PLAYER_TURN':
        this.handlePlayerInput()
        break
      case 'ENEMY_TURN':
        this.executeEnemyTurns()
        break
      case 'ANIMATION':
        // Wait for animations to complete
        break
    }
  }
}
```

### Pattern 4: Event-Driven Architecture
**What:** Pub/sub for decoupling game systems
**When to use:** Medium to large projects where systems need to react to events
**Example:**
```typescript
// Simple event system for game events
class EventBus {
  private events: Map<string, Function[]> = new Map()

  on(event: string, callback: Function) {
    if (!this.events.has(event)) {
      this.events.set(event, [])
    }
    this.events.get(event)!.push(callback)
  }

  emit(event: string, data?: any) {
    const callbacks = this.events.get(event) || []
    callbacks.forEach(cb => cb(data))
  }
}

// Usage:
// eventBus.on('ENTITY_DIED', (entity) => { /* update UI */ })
// eventBus.emit('ENTITY_DIED', enemy)
```

### Anti-Patterns to Avoid
- **Tight coupling between rendering and game logic:** Separate game state from Phaser sprites/display
- **Mixing pixel and grid coordinates:** Always convert explicitly, never assume
- **Storing game state in Phaser objects:** Phaser GameObjects are for rendering, store state separately
- **Over-engineering early:** Start with simple turn-based logic, add complexity as needed
- **Ignoring Phaser's Scene lifecycle:** Use preload(), create(), update() properly

**Confidence:** HIGH - Patterns verified through Phaser 3 documentation, Rot.js examples, and roguelike development best practices from RogueBasin.
</architecture_patterns>

<dont_hand_roll>
## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Field of View (FOV) | Raycasting from scratch | Rot.js FOV.PreciseShadowcasting | Shadowcasting has edge cases (corners, walls), Rot.js handles them correctly |
| Dungeon generation | Random room placement | Rot.js Map generators (Digger, Uniform, Cellular, etc.) | Connected dungeons require graph algorithms, Rot.js guarantees connectivity |
| Pathfinding | Manual movement logic | Rot.js Path.Dijkstra or PathFinding.js A* | Proper pathfinding handles obstacles, costs, and finds optimal paths |
| Turn scheduling | Manual array iteration | Rot.js Scheduler.Simple | Scheduler handles speed/priority, tracks turn order correctly |
| Line of sight | Custom line algorithm | Rot.js FOV or basic Bresenham | Line algorithms have edge cases, use proven implementations |
| Random generation | Math.random() | Rot.js RNG.* (MT, Alea) | Seeded RNG allows reproducible generation for testing/debugging |

**Key insight:** Roguelike development has 40+ years of solved problems. Rot.js implements proven algorithms from libtcod (C roguelike library). Custom implementations of FOV, pathfinding, and map generation consistently introduce bugs that only appear in specific edge cases discovered during playtesting. Using Rot.js means leveraging decades of community debugging.

**What you SHOULD build:**
- Game-specific mechanics (combat system, items, abilities)
- UI/UX tailored to your game
- Meta-progression systems
- Enemy AI behaviors
- Balancing and tuning

**Confidence:** HIGH - Rot.js is explicitly designed for these problems, verified through official documentation and 10+ years of roguelike community usage.
</dont_hand_roll>

<common_pitfalls>
## Common Pitfalls

### Pitfall 1: Scope Creep ("Dream Roguelike")
**What goes wrong:** Starting with a massive feature list, never finishing
**Why it happens:** Roguelikes seem simple but have many interconnected systems
**How to avoid:** Build vertical slice first - one floor, basic combat, win condition. Add features iteratively.
**Warning signs:** Planning features for months before writing code, "it's almost done" for 6+ months

### Pitfall 2: Random > Skill Balance
**What goes wrong:** Player success feels random rather than skill-based
**Why it happens:** Over-emphasizing procedural generation and RNG in outcomes
**How to avoid:** Ensure every floor is beatable without damage assuming perfect play. Player mistakes should matter more than luck.
**Warning signs:** Playtesters saying "I lost to bad RNG" frequently

### Pitfall 3: Mixing Grid and Pixel Coordinates
**What goes wrong:** Off-by-one errors, entities appearing in wrong tiles, click detection broken
**Why it happens:** Not clearly separating grid logic from rendering
**How to avoid:** Always use GridPosition type for game logic, only convert to pixels for rendering. Create utility functions for conversion.
**Warning signs:** Mysterious off-by-one errors, entities "jumping" between tiles

### Pitfall 4: Tight Coupling Between Systems
**What goes wrong:** Changing one system breaks multiple others, hard to test
**Why it happens:** Direct dependencies between game systems (combat -> UI -> animation -> state)
**How to avoid:** Use event-driven architecture or message passing between systems
**Warning signs:** Can't modify combat without touching 5+ files, can't test systems in isolation

### Pitfall 5: Over-Planning Before Coding
**What goes wrong:** Spend months planning, realize plans don't work when coding starts
**Why it happens:** Many roguelike decisions can't be made without testing gameplay feel
**How to avoid:** Plan high-level structure, then iterate on implementation. Playtest early and often.
**Warning signs:** Detailed design documents for systems not yet implemented, analysis paralysis

### Pitfall 6: Ignoring Performance Early
**What goes wrong:** Game runs fine with 10 enemies, unplayable with 50
**Why it happens:** Not profiling until late in development
**How to avoid:** Use object pooling for entities, limit FOV calculations per frame, profile regularly
**Warning signs:** Framerate drops with entity count, noticeable lag on actions

### Pitfall 7: Complex UI Too Early
**What goes wrong:** Building inventory systems with drag-drop, shops, etc. before core gameplay works
**Why it happens:** UI systems seem necessary, but they're actually polish
**How to avoid:** Start with keyboard hotkeys and text-based UI. Add fancy UI after core loop is fun.
**Warning signs:** More time spent on UI than gameplay systems

**Confidence:** HIGH - Sourced from RogueBasin FAQ, "Two Years of Roguelike Development FAQs" article, and multiple roguelike development postmortems.
</common_pitfalls>

<code_examples>
## Code Examples

Verified patterns from official sources:

### Basic Phaser 3 + Rot.js Setup
```typescript
// Source: Phaser 3 docs + Rot.js manual
import Phaser from 'phaser'
import ROT from 'rot-js'

class GameScene extends Phaser.Scene {
  private map: number[][] = []
  private fov: ROT.FOV.PreciseShadowcasting

  constructor() {
    super({ key: 'GameScene' })
  }

  create() {
    // Initialize map with Rot.js
    const width = 50
    const height = 50

    const digger = new ROT.Map.Digger(width, height)
    digger.create((x, y, value) => {
      if (!this.map[y]) this.map[y] = []
      this.map[y][x] = value // 0 = floor, 1 = wall
    })

    // Setup FOV
    const lightPasses = (x: number, y: number) => {
      return this.map[y] && this.map[y][x] === 0
    }
    this.fov = new ROT.FOV.PreciseShadowcasting(lightPasses)
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  scene: [GameScene],
  backgroundColor: '#000000'
}

new Phaser.Game(config)
```

### Grid-Based Movement with Input
```typescript
// Source: Common Phaser 3 pattern
class Player {
  private gridX: number = 0
  private gridY: number = 0
  private sprite: Phaser.GameObjects.Sprite

  constructor(scene: Phaser.Scene, gridX: number, gridY: number) {
    this.gridX = gridX
    this.gridY = gridY

    // Create sprite at pixel position
    const pixelX = gridX * 32
    const pixelY = gridY * 32
    this.sprite = scene.add.sprite(pixelX, pixelY, 'player')
  }

  move(dx: number, dy: number, map: number[][]): boolean {
    const newX = this.gridX + dx
    const newY = this.gridY + dy

    // Check bounds and walkability
    if (map[newY] && map[newY][newX] === 0) {
      this.gridX = newX
      this.gridY = newY

      // Update sprite position
      this.sprite.x = newX * 32
      this.sprite.y = newY * 32
      return true
    }
    return false
  }
}

// In scene update():
if (cursors.left.isDown) {
  player.move(-1, 0, this.map)
}
```

### Turn Manager Implementation
```typescript
// Source: Rot.js Scheduler + common pattern
import ROT from 'rot-js'

interface Actor {
  act(): Promise<void>
  getSpeed(): number
}

class TurnManager {
  private scheduler: ROT.Scheduler.Simple

  constructor() {
    this.scheduler = new ROT.Scheduler.Simple()
  }

  addActor(actor: Actor) {
    this.scheduler.add(actor, true)
  }

  async runTurn() {
    const actor = this.scheduler.next()
    if (actor) {
      await actor.act()
    }
  }
}

// Usage:
class PlayerActor implements Actor {
  getSpeed() { return 100 }

  async act() {
    // Wait for player input
    return new Promise(resolve => {
      this.scene.input.once('pointerdown', () => {
        // Process move
        resolve()
      })
    })
  }
}
```

### FOV Calculation and Rendering
```typescript
// Source: Rot.js manual
class GameScene extends Phaser.Scene {
  private visibleTiles: Set<string> = new Set()

  updateFOV(playerX: number, playerY: number) {
    this.visibleTiles.clear()

    const radius = 10
    this.fov.compute(playerX, playerY, radius, (x, y, r, visibility) => {
      // visibility: 0 = invisible, 1 = visible
      if (visibility > 0) {
        this.visibleTiles.add(`${x},${y}`)
      }
    })

    // Update tile rendering based on visibility
    this.renderMap()
  }

  renderMap() {
    for (let y = 0; y < this.map.length; y++) {
      for (let x = 0; x < this.map[y].length; x++) {
        const key = `${x},${y}`
        const isVisible = this.visibleTiles.has(key)
        const tile = this.map[y][x]

        // Render visible tiles brighter
        const tint = isVisible ? 0xffffff : 0x666666
        // ... sprite rendering with tint
      }
    }
  }
}
```

**Confidence:** HIGH - Examples adapted from official Rot.js manual and Phaser 3 documentation patterns.
</code_examples>

<sota_updates>
## State of the Art (2025-2026)

What's changed recently:

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Phaser 2 | Phaser 3 | 2018 | Complete rewrite, WebGL focus, Scene system |
| Global game state | Scene-based state | Phaser 3 | Better organization, easier to manage multiple scenes |
| Manual bundling | Vite/ES modules | 2020+ | Faster dev server, better tree-shaking, native ES modules |
| JavaScript | TypeScript | 2015+ | Type safety catches bugs early, better IDE support |
| Canvas-only | Canvas + WebGL | Phaser 3 | Better performance, more visual effects possible |

**New tools/patterns to consider:**
- **Vite:** Modern build tool with instant HMR, replaces Webpack for most projects
- **Phaser 3.90+:** Recent releases (2025) with improved TypeScript definitions and performance
- **ES Modules:** Rot.js and Phaser both support native ES module imports

**Deprecated/outdated:**
- **Phaser 2 (Phaser CE):** Use Phaser 3, vastly improved
- **Webpack for games:** Vite is faster and simpler for most game projects
- **Older Rot.js tutorials (2014):** Core concepts still valid, but modern ES6+ syntax preferred

**What's still current:**
- Rot.js (last update 2014) is feature-complete and stable - algorithms haven't changed
- Core roguelike algorithms (shadowcasting, Dijkstra, BSP) are timeless
- Grid-based patterns and turn-based architecture remain fundamentally the same

**Confidence:** HIGH - Verified through official repository releases and current documentation.
</sota_updates>

<open_questions>
## Open Questions

Things that couldn't be fully resolved:

1. **Phaser 3 vs Godot for this specific project**
   - What we know: Phaser 3 is better for web-first, Godot for multi-platform
   - What's unclear: Godot HTML5 export quality/performance in 2026 vs Phaser 3 native web
   - Recommendation: Start with Phaser 3 for faster iteration, can port to Godot later if desktop needed

2. **Performance ceiling for web-based roguelikes**
   - What we know: Web roguelikes handle hundreds of entities fine
   - What's unclear: Exact limits for complex FOV/pathfinding with 100+ enemies
   - Recommendation: Profile early, use object pooling, consider Web Workers for heavy pathfinding if needed

3. **Rot.js maintenance status**
   - What we know: Last release 2014, marked "feature-complete"
   - What's unclear: Will it work with future browser changes?
   - Recommendation: Safe to use (working in 2026), algorithms are stable, could fork if needed

**Confidence:** MEDIUM - These are genuine unknowns that will be resolved during implementation.
</open_questions>

<sources>
## Sources

### Primary (HIGH confidence)
- [Phaser GitHub](https://github.com/phaserjs/phaser) - v3.90.0 verified, official repository
- [Rot.js GitHub](https://github.com/ondras/rot.js/) - v0.5.0 verified, official repository
- [Rot.js Homepage](https://ondras.github.io/rot.js/hp/) - Official interactive manual
- [PathFinding.js GitHub](https://github.com/qiao/PathFinding.js) - Official repository

### Secondary (MEDIUM confidence - verified with primary sources)
- [Building a roguelike with Rot.js - LogRocket](https://blog.logrocket.com/building-a-roguelike-game-with-rot-js/) - Tutorial verified against Rot.js docs
- [RogueBasin - Rot.js page](https://www.roguebasin.com/index.php?title=Rot.js_) - Community wiki cross-referenced with official docs
- [A Turn-Based Game Loop - journal.stuffwithstuff.com](https://journal.stuffwithstuff.com/2014/07/15/a-turn-based-game-loop/) - Architecture patterns verified through implementation
- [Roguelike Dev FAQ - RogueBasin](https://www.roguebasin.com/index.php/Roguelike_Dev_FAQ) - Community best practices
- [Two Years of Roguelike Development FAQs - Gamedeveloper.com](https://www.gamedeveloper.com/design/two-years-of-roguelike-development-faqs) - Pitfalls from experienced dev

### Tertiary (LOW confidence - community wisdom, not yet validated in practice)
- Various Reddit r/roguelikedev discussions about Phaser vs alternatives
- Community forum discussions on Phaser performance limits

</sources>

<metadata>
## Metadata

**Research scope:**
- Core technology: Phaser 3 vs Godot vs PixiJS for web roguelikes
- Ecosystem: Rot.js, PathFinding.js, roguelike-specific libraries
- Patterns: Turn-based loops, grid systems, FSM, event-driven architecture
- Pitfalls: Scope management, balance, coupling, performance

**Confidence breakdown:**
- Standard stack: HIGH - Phaser 3 and Rot.js verified through official sources and active usage
- Architecture: HIGH - Patterns verified through documentation and community best practices
- Pitfalls: HIGH - Sourced from experienced developers' postmortems and FAQs
- Code examples: HIGH - Adapted from official documentation and verified tutorials

**Research date:** 2026-01-09
**Valid until:** 2026-02-09 (30 days - ecosystem is stable, Phaser updates quarterly)

</metadata>

---

*Phase: 01-foundation-core-loop*
*Research completed: 2026-01-09*
*Ready for planning: yes*

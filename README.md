# Metric

A turn-based tactical dungeon crawler with roguelite meta-progression. Explore procedurally generated dungeons, battle enemies, and unlock persistent upgrades that carry across runs.

![Game Preview](https://img.shields.io/badge/Status-Playable-brightgreen)

## Play

```bash
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

## Features

### Combat & Exploration
- **Turn-based tactical combat** - Plan your moves carefully against varied enemies
- **3 enemy types** - Goblins (fast), Archers (ranged), Brutes (tanky)
- **5 item types** - Health potions, buff potions, throwable bombs
- **Status effects** - Poison, burn, strength/defense buffs

### Procedural Generation
- **Unique dungeons each run** - Rooms, corridors, and connections randomized
- **Special room types** - Start (safe), Boss (tough enemies), Treasure (extra loot), Challenge (multiple enemies)
- **Smart placement** - Boss room always at furthest point from start

### Meta-Progression
- **3 playable classes**
  - **Warrior** (green) - Balanced stats (20 HP, 5 ATK, 2 DEF)
  - **Rogue** (yellow) - Glass cannon (16 HP, 7 ATK, 1 DEF)
  - **Guardian** (blue) - Tank (24 HP, 4 ATK, 4 DEF)
- **Persistent upgrades** - Increase Max HP, Attack, or Defense permanently
- **Unlockable content** - New classes and items unlock with currency
- **Currency from kills** - Every enemy defeated earns progress

### Run Management
- **Hub between runs** - Select class, buy upgrades, view stats
- **Death = progress** - Currency earned persists after death
- **Victory bonus** - Clear the dungeon for +10 currency
- **Lifetime tracking** - Total runs, kills, and currency earned

## Controls

| Key | Action |
|-----|--------|
| WASD / Arrows | Move / Attack adjacent enemies |
| 1-5 | Use item from inventory slot |
| R | Return to hub (after death/victory) |

### Targeting Mode (Throwables)
| Key | Action |
|-----|--------|
| Arrows | Cycle between enemies |
| Enter | Throw item |
| Escape | Cancel |

## Tech Stack

- **Phaser 3** - Game framework
- **ROT.js** - Roguelike toolkit (dungeon generation, pathfinding)
- **TypeScript** - Type safety
- **Vite** - Build tool

## Project Structure

```
src/
├── entities/          # Player and enemy classes
│   └── enemies/       # Goblin, Archer, Brute
├── scenes/
│   ├── HubScene.ts    # Pre-run menu
│   └── GameScene.ts   # Main gameplay
├── systems/
│   ├── DungeonGenerator.ts
│   ├── MetaProgressionManager.ts
│   ├── CombatSystem.ts
│   └── ...
├── ui/                # Health bars, inventory, combat log
└── types/             # TypeScript interfaces
```

## Development

```bash
# Install dependencies
npm install

# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Type check
npx tsc --noEmit
```

## Game Loop

```
┌─────────────────────────────────────────┐
│              HUB SCENE                  │
│  • Select class                         │
│  • Buy upgrades (HP, ATK, DEF)          │
│  • Unlock new classes/items             │
│  • View lifetime stats                  │
└────────────────┬────────────────────────┘
                 │ Start Run
                 ▼
┌─────────────────────────────────────────┐
│             GAME SCENE                  │
│  • Explore procedural dungeon           │
│  • Fight enemies, collect items         │
│  • Earn currency from kills             │
└────────────────┬────────────────────────┘
                 │ Death or Victory
                 ▼
┌─────────────────────────────────────────┐
│            END SCREEN                   │
│  • Run summary (kills, currency)        │
│  • Victory bonus (+10 if cleared)       │
│  • Press R to return to hub             │
└────────────────┬────────────────────────┘
                 │
                 └──────► Back to Hub
```

## License

MIT

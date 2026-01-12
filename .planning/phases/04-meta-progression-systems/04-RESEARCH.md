# Phase 4: Meta-Progression Systems Research

## Goals
Implement persistent progression systems that bridge individual runs, including:
1.  **Persistence Layer**: Save/load system for long-term data.
2.  **Currency System**: "Gold" or "Essence" collected during runs.
3.  **Meta-Upgrades**: Permanent stat boosts purchasable between runs.
4.  **Unlockables**: New characters/classes and items added to the pool.
5.  **UI Integration**: Main menu, character selection, and upgrade shop.

## 1. Persistence Architecture
We need a robust way to save progress.
- **Storage**: `localStorage` is sufficient for a web-based roguelite.
- **Data Schema**:
  ```typescript
  interface SaveData {
    currency: number;            // Meta-currency available to spend
    totalCurrencyCollected: number; // Lifetime stats
    runsCompleted: number;
    deaths: number;
    unlockedClasses: string[];   // IDs of unlocked classes (e.g., 'warrior', 'rogue', 'mage')
    unlockedItems: string[];     // IDs of unlocked items
    upgrades: {
      [upgradeId: string]: number; // Level of each upgrade
    };
    settings: {
      volume: number;
      // ...
    };
  }
  ```
- **Manager**: `ProgressionManager` (Singleton) to handle `load()`, `save()`, `addCurrency()`, `purchaseUpgrade()`, `unlockContent()`.

## 2. Currency & Economy
- **Source**:
  - Enemy kills (small amount).
  - Boss kills (large amount).
  - Treasure chests (variable).
  - Excess items (selling? or just breakdown).
- **Sinks**:
  - **Permanent Upgrades**: Linear cost scaling (Level 1: 100, Level 2: 250, etc.).
  - **Class Unlocks**: One-time large purchases or achievement-based.

## 3. Progression Systems

### A. Permanent Upgrades (The "Shop")
Upgrades applying to base stats of all characters or specific ones.
- **Health**: +Max HP (e.g., +5 per level).
- **Strength**: +Attack damage.
- **Wealth**: +Starting gold/currency multiplier.
- **Potions**: Start with a potion.

### B. Item Pool Dilution (Unlocks)
- Start with a "Basic Set" of items.
- "Unlock" items to add them to `ItemDatabase`'s drop tables.
- **Mechanism**:
  - `ItemDatabase` needs a `isUnlocked(itemType)` check.
  - `DungeonGenerator` / `LootTable` only picks from unlocked items.

### C. Character Classes
- **Warrior** (Default): Balanced.
- **Rogue** (Unlockable): High Crit/Speed, Low HP.
- **Mage** (Unlockable): Ranged focus, different resource? (Maybe too complex for v1, stick to stats).
- **Tank** (Unlockable): High HP/Def, Low Dmg.

## 4. UI Flow Changes
Current: Game starts immediately (or simple start screen).
New Flow:
1.  **MainMenu**: "Play", "Upgrades", "Settings".
2.  **Upgrades**: Shop interface to spend currency.
3.  **Character Select**: Choose class before run.
4.  **GameScene**: The run itself.
5.  **GameOver/Victory**: Summary screen -> Return to MainMenu.

## 5. Technical Implementation Steps

### Step 1: Persistence & Manager
- Create `ProgressionManager`.
- Implement `save/load` with `localStorage`.
- Define initial `SaveData` state.

### Step 2: Currency Integration
- Update `GameScene` to track "Run Currency".
- Add UI for "Run Currency" (HUD).
- On Death/Win, transfer "Run Currency" to `ProgressionManager` and save.

### Step 3: Upgrade System & Shop UI
- Define `UpgradeDefinition` (id, name, maxLevel, costCurve, statEffect).
- Create `UpgradeScene` (Shop UI).
- Apply upgrades in `GameScene` (modify `Player` stats on init).

### Step 4: Class System & Selection
- Refactor `Player` to accept `ClassData` configuration.
- Create `CharacterSelectScene`.
- Implement unlocking logic (e.g., "Kill Boss 1 to unlock Rogue").

### Step 5: Item Unlocks
- Add `unlocked` flag to `ItemDatabase`.
- Update loot generation to respect unlocks.
- Add UI to view "Collection" (optional but good).

## 6. Plans Draft

**Plan 04-01: Persistence & Currency Foundation**
- Implement `ProgressionManager`.
- Add currency tracking in `GameScene`.
- create `MainMenuScene` (placeholder) and `GameOverScene` (with currency tally).
- Connect the loop: Menu -> Game -> GameOver -> Menu (with saved currency).

**Plan 04-02: Upgrade System & Shop**
- Implement Upgrade logic/definitions.
- Create `UpgradeScene` UI.
- Hook up `Player` stats to purchased upgrades.

**Plan 04-03: Character Classes & Unlocks**
- Refactor `Player` for class support.
- Implement `CharacterSelectScene`.
- Add simple unlock conditions (e.g., currency purchase or kill count).

**Plan 04-04: Item Unlocks (Optional/Stretch for this phase)**
- Filter item drops by unlock status.
- Add mechanism to unlock items (e.g., "Blueprints" found in dungeon).

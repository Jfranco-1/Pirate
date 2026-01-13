# Pirate Roguelite Development Roadmap

## Project Vision

Transform the generic dungeon crawler into **"Seekers of the Drowned Seal"** - a pirate-themed roguelite with eldritch horror elements where:

1. **Surface narrative**: Break your curse by assembling a statue before the blood moon
2. **Hidden truth**: The "evil" Drowned Sovereign is actually the jailer of something worse
3. **Secret antagonist**: The Pale Messenger - an invisible puppetmaster working through proxies
4. **Discovery arc**: Players gradually realize across runs that reality isn't what it seems

---

## Phase Overview

| Phase | Focus | Status | Est. Time |
|-------|-------|--------|-----------|
| 6.1 | Core Systems Foundation | ✅ COMPLETE | ~2 hrs |
| 6.2 | Ship Layout & Combat | 🔜 Next | ~4 hrs |
| 6.3 | Pirate Enemy Types | Planned | ~3 hrs |
| 6.4 | Crew System | Planned | ~4 hrs |
| 6.5 | World Map & Trading | Planned | ~5 hrs |
| 6.6 | Information System | Planned | ~3 hrs |
| 6.7 | Pale Messenger Integration | Planned | ~4 hrs |
| 6.8 | Narrative & Lore | Planned | ~5 hrs |
| 6.9 | Paranoia & Horror Effects | Planned | ~4 hrs |
| 6.10 | Endings & Polish | Planned | ~5 hrs |

---

## Phase 6.1: Core Systems Foundation ✅ COMPLETE

**Implemented:**
- ✅ InsightSystem (0-100, threshold callbacks)
- ✅ CurseSystem (stages 1-5, manifestations, blood moon timer)
- ✅ PaleAttentionSystem (permanent floor, escalating interventions)
- ✅ PirateClassSystem (Duelist, Quartermaster, Navigator, Chaplain)
- ✅ SessionStateManager (per-run state)
- ✅ Extended types for pirate theme

**Files Created:**
- `src/systems/InsightSystem.ts`
- `src/systems/CurseSystem.ts`
- `src/systems/PaleAttentionSystem.ts`
- `src/systems/PirateClassSystem.ts`
- `src/systems/SessionStateManager.ts`
- `src/types/index.ts` (extended)

---

## Phase 6.2: Ship Layout & Combat

**Objective:** Create multi-level ship dungeons with insight-gated secrets

### Tasks:
1. **ShipLayoutGenerator**
   - Multi-level grids (z-axis for deck levels)
   - ASCII template parsing
   - Faction-specific features

2. **InsightRevealationManager**
   - Filter visible tiles by insight
   - Show "something hidden" hints
   - Reveal animations

3. **Ship Templates**
   - Gilded Armada frigate (hidden Pale shrine)
   - Drowned Fleet hulk (underwater sections)
   - Free Captain merchant (smuggler holds)

4. **Deck Transitions**
   - Stairs between levels
   - Ladders/ropes for quick movement
   - Faction-specific transitions

### Files to Create:
```
src/systems/ShipLayoutGenerator.ts
src/systems/InsightRevealationManager.ts
src/data/ship-templates/
  gilded-frigate.json
  drowned-hulk.json
  free-merchant.json
```

---

## Phase 6.3: Pirate Enemy Types

**Objective:** Replace generic enemies with faction-themed pirates/creatures

### Gilded Armada Enemies:
- **Marine** - Disciplined melee (replaces Goblin)
- **Musketeer** - Ranged (replaces Archer)
- **Officer** - Buffs allies (new type)
- **Thrall** - Coordinated hivemind behavior at high insight

### Drowned Fleet Enemies:
- **Drowned Sailor** - Melee, regenerates in water
- **Lurker** - Stealth, ambush attacks
- **Deepspeaker** - Debuffs, tries to communicate at high insight

### Eldritch Creatures:
- **Pale Spawn** - Fast, weak, appears in groups
- **Watcher** - Doesn't attack, increases Pale Attention
- **Thing That Should Not Be** - Boss-tier, reality-warping

### Files to Create:
```
src/entities/enemies/
  armada/
    Marine.ts
    Musketeer.ts
    Officer.ts
  drowned/
    DrownedSailor.ts
    Lurker.ts
    Deepspeaker.ts
  eldritch/
    PaleSpawn.ts
    Watcher.ts
```

---

## Phase 6.4: Crew System

**Objective:** Implement crew management with loyalty/betrayal mechanics

### Core Features:
1. **Crew Hiring**
   - Visible stats (role, skill, wage)
   - Hidden stats (loyalty, triggers, secrets)
   - Background stories (some fake)

2. **Loyalty System**
   - Morale tracking (0-100)
   - Betrayal triggers
   - Curse effects on crew

3. **Crew Types**
   - Loyalists (genuinely helpful)
   - Opportunists (sell information)
   - Faction Plants (active spies)
   - Wildcards (unpredictable)

4. **Crew in Combat**
   - Additional actions per turn
   - Can betray mid-battle
   - Insight reveals true allegiances

### Files to Create:
```
src/systems/CrewManager.ts
src/entities/CrewMember.ts
src/data/crew-templates.json
src/ui/CrewPanel.ts
```

---

## Phase 6.5: World Map & Trading

**Objective:** Create Trade Winds-style sailing with economic gameplay

### Features:
1. **World Map**
   - Node-based islands
   - Trade routes
   - Dynamic events
   - Time passage

2. **Port System**
   - Markets (buy/sell goods)
   - Taverns (rumors, crew hiring)
   - Shipyards (repairs, upgrades)
   - Faction buildings

3. **Trading Loop**
   - Buy low, sell high
   - Supply/demand
   - Faction reputation affects prices

4. **Random Events**
   - Storms (curse-accelerating)
   - Pirates (combat)
   - Discoveries (insight)
   - Pale Messenger interventions

### Files to Create:
```
src/scenes/WorldMapScene.ts
src/systems/TradingSystem.ts
src/systems/PortManager.ts
src/data/ports.json
src/data/trade-goods.json
```

---

## Phase 6.6: Information System

**Objective:** Implement information trading with reliability mechanics

### Features:
1. **Information Market**
   - Rumors (cheap, unreliable)
   - Trade intel (moderate)
   - Tactical intel (expensive)
   - Cosmic intel (rare)

2. **Reliability System**
   - Source tracking
   - Cross-reference verification
   - Thrall-planted misinformation

3. **Journal/Conspiracy Board**
   - Auto-track contradictions
   - Pin connections
   - Pattern recognition

4. **Information Sources**
   - Captain Iris Venn (reliable merchant)
   - Mother Calendula (cryptic but true)
   - Brother Matthias (Pale Messenger thrall)
   - Lucky Lars (chaotic, accidentally truthful)

### Files to Create:
```
src/systems/InformationMarket.ts
src/systems/JournalManager.ts
src/ui/ConspiracyBoard.ts
src/data/information-sources.json
```

---

## Phase 6.7: Pale Messenger Integration

**Objective:** Make the invisible antagonist feel present without being visible

### Features:
1. **Thrall System**
   - NPCs unknowingly influenced
   - Coordinated behaviors
   - Yellow-gold motifs

2. **Intervention Escalation**
   - Level 0-20: Subtle guidance
   - Level 21-40: Active discouragement
   - Level 41-60: Aggressive intervention
   - Level 61-80: Existential assault
   - Level 81-100: Total war

3. **Environmental Storytelling**
   - Defaced warnings
   - Architectural anomalies
   - Pale Sign in decorations

4. **UI Corruption**
   - Golden static overlays
   - Glitched tooltips
   - Menu manipulation
   - Fourth-wall breaks

### Files to Create:
```
src/systems/ThrallSystem.ts
src/systems/InterventionManager.ts
src/effects/UICorruption.ts
src/data/pale-interventions.json
```

---

## Phase 6.8: Narrative & Lore

**Objective:** Create the discovery experience across multiple runs

### Features:
1. **Readable Texts**
   - Ship logs
   - Historical accounts
   - Mythology books
   - Father's journal fragments

2. **Translation System**
   - Ancient languages
   - Fragment collection
   - Progressive revelation

3. **NPC Dialogue**
   - State-aware responses
   - Insight-gated options
   - Paranoia affects perception

4. **Key NPCs**
   - Mother Calendula (Monastery)
   - Captain Murrow (Drowned Fleet)
   - Admiral Vael (Armada)
   - Your Father (final boss)

### Files to Create:
```
src/systems/LoreManager.ts
src/systems/TranslationSystem.ts
src/systems/DialogueManager.ts
src/data/lore/
  texts.json
  journals.json
  translations.json
src/data/dialogue/
  calendula.json
  murrow.json
  vael.json
```

---

## Phase 6.9: Paranoia & Horror Effects

**Objective:** Create psychological horror after discovering the Pale Messenger

### Features:
1. **Paranoia System**
   - Tied to Pale Messenger discovery
   - Causes hallucinations
   - Affects dialogue options
   - "Ground Yourself" mechanic

2. **Visual Hallucinations**
   - NPC aura flickers
   - False enemy spawns
   - Reality overlays

3. **Audio Effects**
   - Whispers
   - Subliminal messages
   - Reality verification sounds

4. **UI Horror**
   - Button reversals
   - Text corruption
   - Achievement spam
   - Save file metadata

### Files to Create:
```
src/systems/ParanoiaSystem.ts
src/effects/HallucinationManager.ts
src/effects/AudioHorror.ts
src/effects/UIHorror.ts
```

---

## Phase 6.10: Endings & Polish

**Objective:** Implement multiple endings and polish the experience

### Endings:
1. **Bad Ending: Pale Servant**
   - Assemble statue without knowledge
   - Become thrall
   - Perpetuate cycle

2. **Neutral Ending: Drowned Champion**
   - Refuse assembly
   - Take father's place
   - Become eternal guardian

3. **True Ending: The Severance**
   - All statue pieces
   - All binding words
   - 70+ insight
   - Sever both entities
   - Eternal vigilance

### Polish:
1. **New Game+ Mode**
   - "The Watcher's Game"
   - Attention floor persists
   - Different starting conditions

2. **Achievements**
   - Discovery milestones
   - Attention thresholds
   - Endings unlocked

3. **Community Features**
   - Seeking-style warnings
   - Progress tracking
   - Leaderboards

### Files to Create:
```
src/scenes/EndingScene.ts
src/systems/EndingManager.ts
src/systems/AchievementManager.ts
src/data/endings/
  pale-servant.json
  drowned-champion.json
  severance.json
```

---

## Technical Debt & Considerations

### Performance
- Insight filtering needs optimization for large ships
- Paranoia effects should be toggleable for accessibility
- UI corruption must not break gameplay

### Accessibility
- Color-blind options for thrall markers
- Screen shake toggle
- Text-to-speech for lore

### Testing
- Unit tests for core systems
- Integration tests for combat
- Playtest for narrative coherence

---

## Quick Reference: System Interactions

```
                    ┌──────────────────┐
                    │   MetaProgression│
                    │   (Profile-level)│
                    └────────┬─────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌────────────────┐  ┌────────────────┐  ┌────────────────┐
│ PaleAttention  │  │ LoreDiscovered │  │ TranslationProg│
│ (Floor persists)│  │ (Across runs)  │  │ (Across runs)  │
└────────────────┘  └────────────────┘  └────────────────┘
         │
         ▼
┌────────────────────────────────────────────────────────┐
│                    SessionState                         │
│                    (Per-run)                           │
├────────────────┬────────────────┬─────────────────────┤
│    Insight     │     Curse      │    Paranoia         │
│   (0-100)      │   (Stage 1-5)  │    (0-100)          │
└────────────────┴────────────────┴─────────────────────┘
         │                │                │
         └────────────────┼────────────────┘
                          │
                          ▼
              ┌────────────────────┐
              │   Combat/Trading   │
              │   Ship Generation  │
              │   NPC Interactions │
              └────────────────────┘
```

---

## Getting Started: Next Steps

1. **Review 06-01-PLAN.md** - Core systems are implemented
2. **Start 06-02-PLAN.md** - Ship layout system
3. **Create ship templates** - ASCII art for different factions
4. **Integrate with GameScene** - Replace dungeon with ship combat

The foundation is ready. The cosmic horror awaits.

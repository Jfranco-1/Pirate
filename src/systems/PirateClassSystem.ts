import { PirateClass, CombatStats } from '../types';

/**
 * Definition for a pirate character class
 */
export interface PirateClassDefinition {
  id: PirateClass;
  name: string;
  title: string;           // Dramatic title
  description: string;
  lore: string;            // Background/flavor text
  color: number;           // Sprite tint color
  baseStats: CombatStats;
  specialAbility: {
    name: string;
    description: string;
    cooldown?: number;     // Turns between uses
  };
  insightBonus: number;    // Starting insight modifier
  curseResistance: number; // Slows/speeds curse progression (-0.2 to 0.2)
  startingItems?: string[];
}

/**
 * All pirate class definitions
 * 
 * Each class has a distinct playstyle that affects:
 * - Combat effectiveness
 * - Starting insight (affects what you can see early)
 * - Curse progression rate
 * - Special ability
 */
export const PIRATE_CLASSES: Record<PirateClass, PirateClassDefinition> = {
  [PirateClass.DUELIST]: {
    id: PirateClass.DUELIST,
    name: 'Duelist',
    title: 'Blade of the Storm',
    description: 'A blade-master who strikes fast and hard. High damage, low defense.',
    lore: 'In another life, you dueled for honor. Now you fight for survival. ' +
          'The curse quickens your blade, but at what cost?',
    color: 0xff4444,  // Crimson red
    baseStats: {
      maxHP: 18,
      currentHP: 18,
      attack: 7,
      defense: 1
    },
    specialAbility: {
      name: 'Riposte',
      description: 'Counter-attack when hit, dealing 50% damage back',
      cooldown: 0  // Passive
    },
    insightBonus: 0,      // No special perception
    curseResistance: 0,   // Normal curse progression
    startingItems: ['CUTLASS']
  },
  
  [PirateClass.QUARTERMASTER]: {
    id: PirateClass.QUARTERMASTER,
    name: 'Quartermaster',
    title: 'Voice of the Crew',
    description: 'Master of supplies and crew. Buffs allies, controls economy.',
    lore: 'You kept the ship running when the captain couldn\'t. ' +
          'The crew trusts you—but can you trust yourself as the curse spreads?',
    color: 0xffaa00,  // Gold
    baseStats: {
      maxHP: 20,
      currentHP: 20,
      attack: 4,
      defense: 3
    },
    specialAbility: {
      name: 'Rally',
      description: 'Boost crew morale and combat stats for 3 turns',
      cooldown: 5
    },
    insightBonus: 0,
    curseResistance: 0.1,  // 10% slower curse (force of will)
    startingItems: ['LEDGER', 'HEALTH_POTION']
  },
  
  [PirateClass.NAVIGATOR]: {
    id: PirateClass.NAVIGATOR,
    name: 'Navigator',
    title: 'Reader of Winds',
    description: 'Sees paths others miss. High mobility, reveals secrets.',
    lore: 'The stars speak to you, but lately their voices are... wrong. ' +
          'You glimpse hidden passages and secret chambers others cannot perceive.',
    color: 0x00aaff,  // Ocean blue
    baseStats: {
      maxHP: 16,
      currentHP: 16,
      attack: 4,
      defense: 2
    },
    specialAbility: {
      name: 'Phase Step',
      description: 'Move through obstacles and enemies for one turn',
      cooldown: 4
    },
    insightBonus: 10,     // Start with elevated perception
    curseResistance: 0,
    startingItems: ['COMPASS', 'SPYGLASS']
  },
  
  [PirateClass.CHAPLAIN]: {
    id: PirateClass.CHAPLAIN,
    name: 'Chaplain',
    title: 'Keeper of Forbidden Words',
    description: 'Scholar of forbidden knowledge. Rituals and insight mastery.',
    lore: 'You sought the truth in ancient texts. You found it—and it found you. ' +
          'The curse accelerates your understanding, but the knowledge burns.',
    color: 0xaa44ff,  // Eldritch purple
    baseStats: {
      maxHP: 14,
      currentHP: 14,
      attack: 3,
      defense: 2
    },
    specialAbility: {
      name: 'Dispel',
      description: 'Remove status effects from target. At high insight, sense thralls.',
      cooldown: 3
    },
    insightBonus: 20,       // Significant starting insight
    curseResistance: -0.2,  // 20% FASTER curse (knowledge has a price)
    startingItems: ['RITUAL_TOME', 'INCENSE']
  }
};

/**
 * Get class stats with meta-progression upgrades applied
 */
export function getPirateClassStats(
  pirateClass: PirateClass, 
  upgrades: Record<string, number>
): CombatStats {
  const definition = PIRATE_CLASSES[pirateClass];
  const base = definition.baseStats;
  
  const maxHPUpgrade = (upgrades['MAX_HP'] || 0) * 2;
  const attackUpgrade = upgrades['ATTACK'] || 0;
  const defenseUpgrade = upgrades['DEFENSE'] || 0;
  
  return {
    maxHP: base.maxHP + maxHPUpgrade,
    currentHP: base.maxHP + maxHPUpgrade,
    attack: base.attack + attackUpgrade,
    defense: base.defense + defenseUpgrade
  };
}

/**
 * Get class starting insight (including bonus)
 */
export function getPirateClassStartingInsight(pirateClass: PirateClass): number {
  return PIRATE_CLASSES[pirateClass].insightBonus;
}

/**
 * Get class curse resistance modifier
 */
export function getPirateClassCurseResistance(pirateClass: PirateClass): number {
  return PIRATE_CLASSES[pirateClass].curseResistance;
}

/**
 * Get class color for sprite tinting
 */
export function getPirateClassColor(pirateClass: PirateClass): number {
  return PIRATE_CLASSES[pirateClass].color;
}

/**
 * Get class display name
 */
export function getPirateClassName(pirateClass: PirateClass): string {
  return PIRATE_CLASSES[pirateClass].name;
}

/**
 * Get all unlockable pirate classes
 */
export function getAllPirateClasses(): PirateClass[] {
  return [
    PirateClass.DUELIST,
    PirateClass.QUARTERMASTER,
    PirateClass.NAVIGATOR,
    PirateClass.CHAPLAIN
  ];
}

/**
 * Get class unlock costs (for meta-progression shop)
 */
export function getPirateClassUnlockCost(pirateClass: PirateClass): number {
  switch (pirateClass) {
    case PirateClass.DUELIST:
      return 0;  // Starting class, always unlocked
    case PirateClass.QUARTERMASTER:
      return 50;
    case PirateClass.NAVIGATOR:
      return 75;
    case PirateClass.CHAPLAIN:
      return 100;  // Most expensive (most powerful early insight)
  }
}

import { CharacterClass, CombatStats, ItemType, MetaSaveData, MetaUpgradeId } from '../types';

/**
 * MetaProgressionManager
 *
 * Persistent meta-progression state stored in localStorage.
 * - Currency accrues across runs
 * - Upgrades modify starting player stats
 * - Unlocks gate classes/items for future runs
 */
export class MetaProgressionManager {
  private static instance: MetaProgressionManager | null = null;

  private static readonly STORAGE_KEY = 'metric_meta_save_v1';
  private static readonly CURRENT_VERSION = 1;

  private save: MetaSaveData;

  private constructor() {
    this.save = this.loadOrCreate();
  }

  static getInstance(): MetaProgressionManager {
    if (!this.instance) {
      this.instance = new MetaProgressionManager();
    }
    return this.instance;
  }

  // --- Persistence ---

  private loadOrCreate(): MetaSaveData {
    try {
      const raw = localStorage.getItem(MetaProgressionManager.STORAGE_KEY);
      if (!raw) return MetaProgressionManager.createDefaultSave();
      const parsed = JSON.parse(raw) as Partial<MetaSaveData>;
      return MetaProgressionManager.migrateAndSanitize(parsed);
    } catch {
      return MetaProgressionManager.createDefaultSave();
    }
  }

  private static createDefaultSave(): MetaSaveData {
    return {
      version: MetaProgressionManager.CURRENT_VERSION,
      currency: 0,
      upgrades: {
        MAX_HP: 0,
        ATTACK: 0,
        DEFENSE: 0
      },
      // Keep a small initial pool so unlocks feel meaningful.
      unlockedItems: [
        ItemType.HEALTH_POTION,
        ItemType.STRENGTH_POTION,
        ItemType.DEFENSE_POTION,
        ItemType.POISON_BOMB
      ],
      unlockedClasses: [CharacterClass.WARRIOR],
      selectedClass: CharacterClass.WARRIOR,
      lifetime: {
        runsStarted: 0,
        runsEnded: 0,
        enemiesKilled: 0,
        currencyEarned: 0
      }
    };
  }

  private static migrateAndSanitize(parsed: Partial<MetaSaveData>): MetaSaveData {
    const base = MetaProgressionManager.createDefaultSave();

    const version = typeof parsed.version === 'number' ? parsed.version : base.version;
    const currency = typeof parsed.currency === 'number' && Number.isFinite(parsed.currency) ? Math.max(0, parsed.currency) : base.currency;

    const upgrades: Record<MetaUpgradeId, number> = {
      MAX_HP: MetaProgressionManager.readNonNegativeInt(parsed.upgrades?.MAX_HP, base.upgrades.MAX_HP),
      ATTACK: MetaProgressionManager.readNonNegativeInt(parsed.upgrades?.ATTACK, base.upgrades.ATTACK),
      DEFENSE: MetaProgressionManager.readNonNegativeInt(parsed.upgrades?.DEFENSE, base.upgrades.DEFENSE)
    };

    const unlockedItems = Array.isArray(parsed.unlockedItems)
      ? parsed.unlockedItems.filter((x): x is ItemType => typeof x === 'number')
      : base.unlockedItems;
    const unlockedClasses = Array.isArray(parsed.unlockedClasses)
      ? parsed.unlockedClasses.filter((x): x is CharacterClass => typeof x === 'number')
      : base.unlockedClasses;

    const selectedClass = typeof parsed.selectedClass === 'number' ? parsed.selectedClass : base.selectedClass;

    const lifetime = {
      runsStarted: MetaProgressionManager.readNonNegativeInt(parsed.lifetime?.runsStarted, base.lifetime.runsStarted),
      runsEnded: MetaProgressionManager.readNonNegativeInt(parsed.lifetime?.runsEnded, base.lifetime.runsEnded),
      enemiesKilled: MetaProgressionManager.readNonNegativeInt(parsed.lifetime?.enemiesKilled, base.lifetime.enemiesKilled),
      currencyEarned: MetaProgressionManager.readNonNegativeInt(parsed.lifetime?.currencyEarned, base.lifetime.currencyEarned)
    };

    return {
      ...base,
      version,
      currency,
      upgrades,
      unlockedItems: unlockedItems.length ? unlockedItems : base.unlockedItems,
      unlockedClasses: unlockedClasses.length ? unlockedClasses : base.unlockedClasses,
      selectedClass,
      lifetime
    };
  }

  private static readNonNegativeInt(value: unknown, fallback: number): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
    return Math.max(0, Math.floor(value));
  }

  saveNow(): void {
    try {
      localStorage.setItem(MetaProgressionManager.STORAGE_KEY, JSON.stringify(this.save));
    } catch {
      // Ignore persistence errors (e.g. storage disabled).
    }
  }

  resetSave(): void {
    this.save = MetaProgressionManager.createDefaultSave();
    this.saveNow();
  }

  // --- Currency ---

  getCurrency(): number {
    return this.save.currency;
  }

  addCurrency(amount: number): void {
    if (!Number.isFinite(amount)) return;
    const delta = Math.max(0, Math.floor(amount));
    if (delta === 0) return;
    this.save.currency += delta;
    this.save.lifetime.currencyEarned += delta;
    this.saveNow();
  }

  spendCurrency(amount: number): boolean {
    const cost = Math.max(0, Math.floor(amount));
    if (cost <= 0) return true;
    if (this.save.currency < cost) return false;
    this.save.currency -= cost;
    this.saveNow();
    return true;
  }

  // --- Runs / lifetime ---

  markRunStarted(): void {
    this.save.lifetime.runsStarted += 1;
    this.saveNow();
  }

  markRunEnded(): void {
    this.save.lifetime.runsEnded += 1;
    this.saveNow();
  }

  recordEnemyKill(): void {
    this.save.lifetime.enemiesKilled += 1;
    this.saveNow();
  }

  getLifetime(): MetaSaveData['lifetime'] {
    return { ...this.save.lifetime };
  }

  // --- Upgrades ---

  getUpgradeLevel(id: MetaUpgradeId): number {
    return this.save.upgrades[id] ?? 0;
  }

  getUpgradeCost(id: MetaUpgradeId): number {
    const level = this.getUpgradeLevel(id);
    const base = id === 'MAX_HP' ? 10 : 15;
    return base * (level + 1);
  }

  purchaseUpgrade(id: MetaUpgradeId): boolean {
    const cost = this.getUpgradeCost(id);
    if (!this.spendCurrency(cost)) return false;
    this.save.upgrades[id] = this.getUpgradeLevel(id) + 1;
    this.saveNow();
    return true;
  }

  // --- Items / unlock gating ---

  isItemUnlocked(type: ItemType): boolean {
    return this.save.unlockedItems.includes(type);
  }

  unlockItem(type: ItemType, cost: number): boolean {
    if (this.isItemUnlocked(type)) return true;
    if (!this.spendCurrency(cost)) return false;
    this.save.unlockedItems.push(type);
    this.saveNow();
    return true;
  }

  // --- Classes ---

  isClassUnlocked(cls: CharacterClass): boolean {
    return this.save.unlockedClasses.includes(cls);
  }

  unlockClass(cls: CharacterClass, cost: number): boolean {
    if (this.isClassUnlocked(cls)) return true;
    if (!this.spendCurrency(cost)) return false;
    this.save.unlockedClasses.push(cls);
    this.saveNow();
    return true;
  }

  getSelectedClass(): CharacterClass {
    return this.save.selectedClass;
  }

  setSelectedClass(cls: CharacterClass): void {
    if (!this.isClassUnlocked(cls)) return;
    this.save.selectedClass = cls;
    this.saveNow();
  }

  getUnlockedClasses(): CharacterClass[] {
    return [...this.save.unlockedClasses];
  }

  // --- Player stat application ---

  /**
   * Starting stats for a class *after* applying persistent upgrades.
   * CurrentHP is set to MaxHP.
   */
  getStartingPlayerStats(cls: CharacterClass = this.getSelectedClass()): CombatStats {
    const base = MetaProgressionManager.getBaseClassStats(cls);
    const maxHP = base.maxHP + (2 * this.getUpgradeLevel('MAX_HP'));
    const attack = base.attack + this.getUpgradeLevel('ATTACK');
    const defense = base.defense + this.getUpgradeLevel('DEFENSE');
    return {
      maxHP,
      currentHP: maxHP,
      attack,
      defense
    };
  }

  getClassName(cls: CharacterClass): string {
    switch (cls) {
      case CharacterClass.WARRIOR: return 'Warrior';
      case CharacterClass.ROGUE: return 'Rogue';
      case CharacterClass.GUARDIAN: return 'Guardian';
      default: return 'Unknown';
    }
  }

  private static getBaseClassStats(cls: CharacterClass): CombatStats {
    switch (cls) {
      case CharacterClass.WARRIOR:
        return { maxHP: 20, currentHP: 20, attack: 5, defense: 2 };
      case CharacterClass.ROGUE:
        return { maxHP: 16, currentHP: 16, attack: 7, defense: 1 };
      case CharacterClass.GUARDIAN:
        return { maxHP: 24, currentHP: 24, attack: 4, defense: 4 };
      default:
        return { maxHP: 20, currentHP: 20, attack: 5, defense: 2 };
    }
  }
  
  // --- Lore Discovery (Profile-level persistence) ---
  
  /**
   * Check if a lore entry has been discovered
   */
  hasDiscoveredLore(loreId: string): boolean {
    const discovered = (this.save as any).loreDiscovered || [];
    return discovered.includes(loreId);
  }
  
  /**
   * Mark a lore entry as discovered
   */
  discoverLore(loreId: string): void {
    if (!((this.save as any).loreDiscovered)) {
      (this.save as any).loreDiscovered = [];
    }
    
    if (!(this.save as any).loreDiscovered.includes(loreId)) {
      (this.save as any).loreDiscovered.push(loreId);
      this.saveNow();
    }
  }
  
  /**
   * Get all discovered lore IDs
   */
  getDiscoveredLoreIds(): string[] {
    return [...((this.save as any).loreDiscovered || [])];
  }
  
  /**
   * Get count of discovered lore
   */
  getDiscoveredLoreCount(): number {
    return ((this.save as any).loreDiscovered || []).length;
  }
  
  // --- Translation Progress ---
  
  /**
   * Get translation fragment count for a text
   */
  getTranslationProgress(textId: string): number {
    const progress = (this.save as any).translationProgress || {};
    return progress[textId] || 0;
  }
  
  /**
   * Add translation fragment for a text
   */
  addTranslationFragment(textId: string): number {
    if (!(this.save as any).translationProgress) {
      (this.save as any).translationProgress = {};
    }
    
    const current = (this.save as any).translationProgress[textId] || 0;
    (this.save as any).translationProgress[textId] = current + 1;
    this.saveNow();
    
    return (this.save as any).translationProgress[textId];
  }
  
  // --- Pale Attention (Profile-level) ---
  
  /**
   * Get current Pale Messenger attention level
   */
  getPaleAttention(): number {
    return (this.save as any).paleAttention?.current || 0;
  }
  
  /**
   * Get Pale Attention floor (permanent minimum)
   */
  getPaleAttentionFloor(): number {
    return (this.save as any).paleAttention?.floor || 0;
  }
  
  /**
   * Add Pale Attention - locks floor at thresholds
   */
  addPaleAttention(amount: number): void {
    if (!(this.save as any).paleAttention) {
      (this.save as any).paleAttention = { current: 0, floor: 0 };
    }
    
    const oldValue = (this.save as any).paleAttention.current;
    (this.save as any).paleAttention.current = Math.min(100, oldValue + amount);
    
    // Lock floor at thresholds (PERMANENT)
    const thresholds = [20, 40, 60, 80, 100];
    for (const threshold of thresholds) {
      if ((this.save as any).paleAttention.current >= threshold && 
          (this.save as any).paleAttention.floor < threshold) {
        (this.save as any).paleAttention.floor = threshold;
        console.log(`[PALE ATTENTION] Floor locked at ${threshold} - PERMANENT`);
      }
    }
    
    this.saveNow();
  }
  
  /**
   * Reduce Pale Attention (cannot go below floor)
   */
  reducePaleAttention(amount: number): void {
    if (!(this.save as any).paleAttention) return;
    
    const floor = (this.save as any).paleAttention.floor || 0;
    (this.save as any).paleAttention.current = Math.max(
      floor,
      (this.save as any).paleAttention.current - amount
    );
    this.saveNow();
  }
  
  /**
   * Check if player has discovered the Pale Messenger's existence
   */
  hasDiscoveredPaleMessenger(): boolean {
    return (this.save as any).awarenessThresholdCrossed || false;
  }
  
  /**
   * Mark that player has discovered the Pale Messenger
   */
  markPaleMessengerDiscovered(): void {
    (this.save as any).awarenessThresholdCrossed = true;
    
    // Immediately lock attention floor at 20
    if (!(this.save as any).paleAttention) {
      (this.save as any).paleAttention = { current: 20, floor: 20 };
    } else if ((this.save as any).paleAttention.floor < 20) {
      (this.save as any).paleAttention.current = Math.max(
        (this.save as any).paleAttention.current, 
        20
      );
      (this.save as any).paleAttention.floor = 20;
    }
    
    this.saveNow();
  }
}


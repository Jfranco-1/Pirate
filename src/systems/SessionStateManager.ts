import { InsightSystem } from './InsightSystem';
import { CurseSystem } from './CurseSystem';
import { PirateClass, InsightThreshold } from '../types';
import { PIRATE_CLASSES, getPirateClassStartingInsight, getPirateClassCurseResistance } from './PirateClassSystem';

/**
 * Statue piece IDs
 */
export const STATUE_PIECES = [
  'HEAD',
  'TORSO', 
  'LEFT_ARM',
  'RIGHT_ARM',
  'BASE'
] as const;

/**
 * Binding word IDs
 */
export const BINDING_WORDS = [
  'WORD_OF_DEPTHS',    // From Drowned Fleet
  'WORD_OF_SURFACES',  // From Monastery
  'WORD_OF_WILL'       // Player creates this
] as const;

/**
 * Session state that persists for a single run
 */
export interface SessionState {
  pirateClass: PirateClass;
  currentDay: number;
  statuePieces: string[];
  bindingWords: string[];
  enemiesKilled: number;
  goldEarned: number;
  secretsFound: number;
}

/**
 * SessionStateManager - Manages per-run state that resets on death
 * 
 * This is separate from MetaProgressionManager which handles persistent state.
 * SessionStateManager tracks:
 * - Current insight level
 * - Curse progression
 * - Collected statue pieces
 * - Learned binding words
 * - Day counter
 * - Run statistics
 */
export class SessionStateManager {
  private static instance: SessionStateManager | null = null;
  
  // Core systems
  private insight: InsightSystem;
  private curse: CurseSystem;
  
  // Run state
  private pirateClass: PirateClass;
  private currentDay: number;
  private statuePieces: string[];
  private bindingWords: string[];
  
  // Statistics
  private enemiesKilled: number;
  private goldEarned: number;
  private secretsFound: number;
  
  // Class-specific modifiers
  private curseResistance: number;
  
  private constructor() {
    this.pirateClass = PirateClass.DUELIST;
    this.insight = new InsightSystem(0);
    this.curse = new CurseSystem(30);
    this.currentDay = 1;
    this.statuePieces = [];
    this.bindingWords = [];
    this.enemiesKilled = 0;
    this.goldEarned = 0;
    this.secretsFound = 0;
    this.curseResistance = 0;
  }
  
  /**
   * Get singleton instance
   */
  static getInstance(): SessionStateManager {
    if (!SessionStateManager.instance) {
      SessionStateManager.instance = new SessionStateManager();
    }
    return SessionStateManager.instance;
  }
  
  /**
   * Start a new run with specified class
   */
  startNewRun(pirateClass: PirateClass, daysUntilBloodMoon: number = 30): void {
    console.log(`[Session] Starting new run as ${PIRATE_CLASSES[pirateClass].name}`);
    
    this.pirateClass = pirateClass;
    this.curseResistance = getPirateClassCurseResistance(pirateClass);
    
    // Initialize insight with class bonus
    const startingInsight = getPirateClassStartingInsight(pirateClass);
    this.insight = new InsightSystem(startingInsight);
    
    // Initialize curse
    this.curse = new CurseSystem(daysUntilBloodMoon);
    
    // Reset run state
    this.currentDay = 1;
    this.statuePieces = [];
    this.bindingWords = [];
    this.enemiesKilled = 0;
    this.goldEarned = 0;
    this.secretsFound = 0;
    
    // Register insight threshold callbacks
    this.setupInsightCallbacks();
    
    // Register curse stage callbacks
    this.setupCurseCallbacks();
  }
  
  /**
   * Setup callbacks for insight threshold crossings
   */
  private setupInsightCallbacks(): void {
    this.insight.onThreshold(InsightThreshold.SUSPICION, () => {
      console.log('[Session] Player has reached SUSPICION - patterns emerge');
      // TODO: Trigger UI notification, unlock journal features
    });
    
    this.insight.onThreshold(InsightThreshold.UNDERSTANDING, () => {
      console.log('[Session] Player has reached UNDERSTANDING - structural awareness');
      // TODO: Thrall detection becomes possible
    });
    
    this.insight.onThreshold(InsightThreshold.TRUE_SIGHT, () => {
      console.log('[Session] Player has reached TRUE_SIGHT - hidden truths revealed');
      // TODO: Hidden passages become visible, NPC auras appear
    });
    
    this.insight.onThreshold(InsightThreshold.TRANSCENDENCE, () => {
      console.log('[Session] Player has reached TRANSCENDENCE - reality bends');
      // TODO: Full cosmic awareness, Pale Messenger becomes visible
    });
  }
  
  /**
   * Setup callbacks for curse stage changes
   */
  private setupCurseCallbacks(): void {
    this.curse.onStage(2, () => {
      console.log('[Session] Curse Stage 2 - Physical changes begin');
      // TODO: Visual changes to player, NPC reactions change
    });
    
    this.curse.onStage(3, () => {
      console.log('[Session] Curse Stage 3 - Transformation accelerates');
      // TODO: Mechanical penalties, hallucinations possible
    });
    
    this.curse.onStage(4, () => {
      console.log('[Session] Curse Stage 4 - Critical transformation');
      // TODO: Major debuffs, some areas become accessible
    });
    
    this.curse.onCritical(() => {
      console.log('[Session] Curse Stage 5 - CRITICAL');
      // TODO: Final warning, game over approaches
    });
    
    this.curse.onBloodMoon(() => {
      console.log('[Session] BLOOD MOON - Time has run out');
      // TODO: Trigger bad ending sequence
    });
  }
  
  // --- System Getters ---
  
  getInsight(): InsightSystem {
    return this.insight;
  }
  
  getCurse(): CurseSystem {
    return this.curse;
  }
  
  getPirateClass(): PirateClass {
    return this.pirateClass;
  }
  
  getCurrentDay(): number {
    return this.currentDay;
  }
  
  // --- Time Management ---
  
  /**
   * Advance game time by specified days
   * Applies curse resistance from class
   */
  advanceDay(days: number = 1): void {
    this.currentDay += days;
    
    // Apply curse resistance (slows or speeds progression)
    const effectiveDays = days * (1 - this.curseResistance);
    this.curse.advanceDay(effectiveDays);
    
    console.log(`[Session] Day ${this.currentDay}, ${this.curse.getDaysRemaining()} days until blood moon`);
  }
  
  // --- Statue Pieces ---
  
  getStatuePieces(): string[] {
    return [...this.statuePieces];
  }
  
  hasStatuePiece(pieceId: string): boolean {
    return this.statuePieces.includes(pieceId);
  }
  
  collectStatuePiece(pieceId: string): boolean {
    if (this.statuePieces.includes(pieceId)) {
      console.log(`[Session] Already have statue piece: ${pieceId}`);
      return false;
    }
    
    this.statuePieces.push(pieceId);
    console.log(`[Session] Collected statue piece: ${pieceId} (${this.statuePieces.length}/5)`);
    
    // Collecting pieces grants insight (you're learning about the cosmic forces)
    this.insight.gain(15, `Collected statue piece: ${pieceId}`);
    
    return true;
  }
  
  hasAllStatuePieces(): boolean {
    return this.statuePieces.length >= STATUE_PIECES.length;
  }
  
  // --- Binding Words ---
  
  getBindingWords(): string[] {
    return [...this.bindingWords];
  }
  
  hasBindingWord(wordId: string): boolean {
    return this.bindingWords.includes(wordId);
  }
  
  learnBindingWord(wordId: string): boolean {
    if (this.bindingWords.includes(wordId)) {
      console.log(`[Session] Already know binding word: ${wordId}`);
      return false;
    }
    
    this.bindingWords.push(wordId);
    console.log(`[Session] Learned binding word: ${wordId} (${this.bindingWords.length}/3)`);
    
    // Learning words grants significant insight
    this.insight.gain(25, `Learned binding word: ${wordId}`);
    
    return true;
  }
  
  hasAllBindingWords(): boolean {
    return this.bindingWords.length >= BINDING_WORDS.length;
  }
  
  // --- Win Condition Checks ---
  
  /**
   * Check if player can attempt the Severance ritual (true ending)
   */
  canPerformSeverance(): boolean {
    return this.hasAllStatuePieces() && 
           this.hasAllBindingWords() &&
           this.insight.meetsThreshold(InsightThreshold.TRUE_SIGHT);
  }
  
  /**
   * Check if player can attempt to assemble statue (bad ending path)
   */
  canAssembleStatue(): boolean {
    return this.hasAllStatuePieces();
  }
  
  /**
   * Get ending eligibility
   */
  getAvailableEndings(): string[] {
    const endings: string[] = [];
    
    if (this.canPerformSeverance()) {
      endings.push('SEVERANCE');  // True ending
    }
    
    if (this.canAssembleStatue()) {
      endings.push('ASSEMBLE');   // Bad ending (Pale Servant)
    }
    
    // Drowned Champion ending requires refusing to assemble + high insight
    if (this.insight.meetsThreshold(InsightThreshold.UNDERSTANDING)) {
      endings.push('REFUSE');     // Drowned Champion ending
    }
    
    return endings;
  }
  
  // --- Statistics ---
  
  recordKill(): void {
    this.enemiesKilled++;
    this.curse.recordAction('combat', 1);
  }
  
  recordGoldEarned(amount: number): void {
    this.goldEarned += amount;
    this.curse.recordAction('trade', amount / 10);  // Scale trade actions
  }
  
  recordSecretFound(): void {
    this.secretsFound++;
    this.curse.recordAction('exploration', 2);  // Secrets count more
    this.insight.gain(5, 'Discovered secret');
  }
  
  getStatistics(): { kills: number; gold: number; secrets: number } {
    return {
      kills: this.enemiesKilled,
      gold: this.goldEarned,
      secrets: this.secretsFound
    };
  }
  
  // --- Run Summary ---
  
  /**
   * Get summary of current run state
   */
  getRunSummary(): {
    day: number;
    daysRemaining: number;
    insight: number;
    insightLevel: string;
    curseStage: number;
    curseManifestation: string;
    statuePieces: number;
    bindingWords: number;
    statistics: { kills: number; gold: number; secrets: number };
  } {
    return {
      day: this.currentDay,
      daysRemaining: this.curse.getDaysRemaining(),
      insight: this.insight.getCurrent(),
      insightLevel: this.insight.getThresholdLevel(),
      curseStage: this.curse.getStage(),
      curseManifestation: this.curse.getManifestationName(),
      statuePieces: this.statuePieces.length,
      bindingWords: this.bindingWords.length,
      statistics: this.getStatistics()
    };
  }
  
  // --- Serialization ---
  
  serialize(): SessionState {
    return {
      pirateClass: this.pirateClass,
      currentDay: this.currentDay,
      statuePieces: [...this.statuePieces],
      bindingWords: [...this.bindingWords],
      enemiesKilled: this.enemiesKilled,
      goldEarned: this.goldEarned,
      secretsFound: this.secretsFound
    };
  }
  
  /**
   * Note: Full deserialization would also need insight and curse state
   * This is a simplified version for basic state
   */
  deserialize(data: SessionState): void {
    this.pirateClass = data.pirateClass;
    this.currentDay = data.currentDay;
    this.statuePieces = [...data.statuePieces];
    this.bindingWords = [...data.bindingWords];
    this.enemiesKilled = data.enemiesKilled;
    this.goldEarned = data.goldEarned;
    this.secretsFound = data.secretsFound;
  }
}

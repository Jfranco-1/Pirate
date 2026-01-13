import { CurseState, CurseManifestation } from '../types';

/**
 * Curse effects applied based on stage and manifestation type
 */
export interface CurseEffects {
  // Combat modifiers
  attackModifier: number;      // Multiplier (1.0 = normal, 1.1 = +10%)
  defenseModifier: number;
  
  // Economic modifiers
  priceModifier: number;       // Trading prices (1.0 = normal, 1.2 = +20%)
  
  // Social modifiers  
  crewMoraleModifier: number;  // Flat bonus/penalty to crew morale
  npcFearLevel: number;        // How scared NPCs are (0-1)
  
  // Insight modifiers
  insightGainModifier: number; // Multiplier for insight gains
  
  // Curse-specific effects
  hallucinationChance: number; // Chance of false perceptions (0-1)
  randomEventBias: number;     // Bias toward negative events (-1 to 1)
}

/**
 * CurseSystem - Manages the player's curse progression
 * 
 * The curse is central to the game's time pressure:
 * - You have until the blood moon (default 30 days) to break it
 * - Curse stages (1-5) increase as time passes or through story events
 * - Your playstyle determines how the curse manifests
 * 
 * Manifestation types:
 * - COMBAT: Bloodthirst - Stronger but feared, trading penalties
 * - TRADE: Compulsion - Better prices but eroding trust, crew unease
 * - EXPLORATION: Spatial Distortion - See more but fragile, navigation issues
 * - BALANCED: Mild effects across all categories
 */
export class CurseSystem {
  private state: CurseState;
  private stageCallbacks: Map<number, (() => void)[]>;
  private criticalCallbacks: (() => void)[];
  private bloodMoonCallbacks: (() => void)[];
  
  constructor(daysUntilBloodMoon: number = 30) {
    this.state = {
      stage: 1,
      manifestation: CurseManifestation.BALANCED,
      daysRemaining: daysUntilBloodMoon,
      playstyleScores: {
        combat: 0,
        trade: 0,
        exploration: 0
      }
    };
    
    this.stageCallbacks = new Map();
    this.criticalCallbacks = [];
    this.bloodMoonCallbacks = [];
    
    // Initialize callback arrays for stages 2-5
    for (let i = 2; i <= 5; i++) {
      this.stageCallbacks.set(i, []);
    }
  }
  
  // --- Getters ---
  
  getStage(): number {
    return this.state.stage;
  }
  
  getManifestation(): CurseManifestation {
    return this.state.manifestation;
  }
  
  getManifestationName(): string {
    switch (this.state.manifestation) {
      case CurseManifestation.COMBAT: return 'The Butcher\'s Path';
      case CurseManifestation.TRADE: return 'The Silver Tongue';
      case CurseManifestation.EXPLORATION: return 'The Witness';
      case CurseManifestation.BALANCED: return 'The Uncertain';
    }
  }
  
  getDaysRemaining(): number {
    return this.state.daysRemaining;
  }
  
  getPlaystyleScores(): { combat: number; trade: number; exploration: number } {
    return { ...this.state.playstyleScores };
  }
  
  // --- Time Management ---
  
  /**
   * Advance one day - call this when the player takes a major action
   * (travel between islands, complete dungeons, rest)
   */
  advanceDay(days: number = 1): void {
    this.state.daysRemaining = Math.max(0, this.state.daysRemaining - days);
    
    // Check for automatic stage progression based on time
    this.checkTimeBasedProgression();
    
    // Check for blood moon
    if (this.state.daysRemaining <= 0 && this.bloodMoonCallbacks.length > 0) {
      console.log('[Curse] BLOOD MOON HAS RISEN');
      this.bloodMoonCallbacks.forEach(cb => cb());
    }
  }
  
  /**
   * Check if curse should progress based on remaining time
   */
  private checkTimeBasedProgression(): void {
    const remaining = this.state.daysRemaining;
    
    // Stage thresholds (days remaining)
    // Stage 5: <= 6 days
    // Stage 4: <= 12 days
    // Stage 3: <= 18 days
    // Stage 2: <= 24 days
    
    if (remaining <= 6 && this.state.stage < 5) {
      this.setStage(5);
    } else if (remaining <= 12 && this.state.stage < 4) {
      this.setStage(4);
    } else if (remaining <= 18 && this.state.stage < 3) {
      this.setStage(3);
    } else if (remaining <= 24 && this.state.stage < 2) {
      this.setStage(2);
    }
  }
  
  // --- Playstyle Tracking ---
  
  /**
   * Record a playstyle action to influence manifestation
   * Call this when the player:
   * - Fights enemies (combat)
   * - Makes trades (trade)
   * - Explores/discovers secrets (exploration)
   */
  recordAction(type: 'combat' | 'trade' | 'exploration', weight: number = 1): void {
    this.state.playstyleScores[type] += weight;
    this.updateManifestation();
  }
  
  /**
   * Update manifestation based on accumulated playstyle
   */
  private updateManifestation(): void {
    const { combat, trade, exploration } = this.state.playstyleScores;
    const total = combat + trade + exploration;
    
    // Need minimum actions before manifestation locks in
    if (total < 10) {
      this.state.manifestation = CurseManifestation.BALANCED;
      return;
    }
    
    const combatRatio = combat / total;
    const tradeRatio = trade / total;
    const explorationRatio = exploration / total;
    
    // Need >50% in one category to manifest that type
    if (combatRatio > 0.5) {
      this.state.manifestation = CurseManifestation.COMBAT;
    } else if (tradeRatio > 0.5) {
      this.state.manifestation = CurseManifestation.TRADE;
    } else if (explorationRatio > 0.5) {
      this.state.manifestation = CurseManifestation.EXPLORATION;
    } else {
      this.state.manifestation = CurseManifestation.BALANCED;
    }
  }
  
  // --- Stage Management ---
  
  /**
   * Set curse stage directly (for story events, insight discoveries)
   * Stage can only increase, never decrease
   */
  setStage(stage: number): void {
    const newStage = Math.max(1, Math.min(5, stage));
    
    if (newStage <= this.state.stage) return;
    
    const oldStage = this.state.stage;
    this.state.stage = newStage;
    
    console.log(`[Curse] Stage advanced: ${oldStage} → ${newStage}`);
    
    // Trigger callbacks for each stage crossed
    for (let s = oldStage + 1; s <= newStage; s++) {
      const callbacks = this.stageCallbacks.get(s) || [];
      callbacks.forEach(cb => cb());
    }
    
    // Trigger critical callback if reaching stage 5
    if (newStage >= 5) {
      this.criticalCallbacks.forEach(cb => cb());
    }
  }
  
  /**
   * Register callback for specific stage
   */
  onStage(stage: number, callback: () => void): void {
    if (stage < 2 || stage > 5) return;
    
    const callbacks = this.stageCallbacks.get(stage);
    if (callbacks) {
      callbacks.push(callback);
    }
  }
  
  /**
   * Register callback for critical curse (stage 5)
   */
  onCritical(callback: () => void): void {
    this.criticalCallbacks.push(callback);
  }
  
  /**
   * Register callback for blood moon (time runs out)
   */
  onBloodMoon(callback: () => void): void {
    this.bloodMoonCallbacks.push(callback);
  }
  
  // --- Effects Calculation ---
  
  /**
   * Get all current curse effects based on stage and manifestation
   */
  getEffects(): CurseEffects {
    const stage = this.state.stage;
    const manifestation = this.state.manifestation;
    
    // Base effects that apply to all manifestations
    const effects: CurseEffects = {
      attackModifier: 1.0,
      defenseModifier: 1.0,
      priceModifier: 1.0,
      crewMoraleModifier: 0,
      npcFearLevel: stage * 0.1,  // NPCs get increasingly scared
      insightGainModifier: 1.0,
      hallucinationChance: Math.max(0, (stage - 2) * 0.05),  // Starts at stage 3
      randomEventBias: (stage - 1) * 0.05  // Slight bias toward negative events
    };
    
    // Apply manifestation-specific modifiers
    switch (manifestation) {
      case CurseManifestation.COMBAT:
        // The Butcher's Path: Strong but feared
        effects.attackModifier = 1 + (stage * 0.05);      // +5% per stage
        effects.priceModifier = 1 + (stage * 0.05);       // +5% prices (feared)
        effects.crewMoraleModifier = -stage * 2;          // Crew is scared
        effects.npcFearLevel = Math.min(1, stage * 0.2);  // Very scary
        break;
        
      case CurseManifestation.TRADE:
        // The Silver Tongue: Compelling but untrustworthy
        effects.priceModifier = 1 - (stage * 0.03);       // -3% prices (compulsion)
        effects.crewMoraleModifier = -stage * 3;          // Trust erodes fast
        effects.npcFearLevel = stage * 0.05;              // Less scary, more unsettling
        break;
        
      case CurseManifestation.EXPLORATION:
        // The Witness: Perceptive but fragile
        effects.insightGainModifier = 1 + (stage * 0.1);  // +10% insight per stage
        effects.defenseModifier = 1 - (stage * 0.03);     // -3% defense
        effects.hallucinationChance += stage * 0.05;      // More hallucinations
        break;
        
      case CurseManifestation.BALANCED:
        // The Uncertain: Mild everything
        effects.attackModifier = 1 + (stage * 0.02);
        effects.priceModifier = 1 + (stage * 0.02);
        effects.crewMoraleModifier = -stage;
        break;
    }
    
    return effects;
  }
  
  /**
   * Get description of current curse effects for UI
   */
  getEffectsDescription(): string[] {
    const effects = this.getEffects();
    const descriptions: string[] = [];
    
    if (effects.attackModifier !== 1.0) {
      const sign = effects.attackModifier > 1 ? '+' : '';
      descriptions.push(`Attack: ${sign}${Math.round((effects.attackModifier - 1) * 100)}%`);
    }
    
    if (effects.defenseModifier !== 1.0) {
      const sign = effects.defenseModifier > 1 ? '+' : '';
      descriptions.push(`Defense: ${sign}${Math.round((effects.defenseModifier - 1) * 100)}%`);
    }
    
    if (effects.priceModifier !== 1.0) {
      const sign = effects.priceModifier > 1 ? '+' : '';
      descriptions.push(`Prices: ${sign}${Math.round((effects.priceModifier - 1) * 100)}%`);
    }
    
    if (effects.crewMoraleModifier !== 0) {
      descriptions.push(`Crew Morale: ${effects.crewMoraleModifier}`);
    }
    
    if (effects.hallucinationChance > 0) {
      descriptions.push(`Hallucination Chance: ${Math.round(effects.hallucinationChance * 100)}%`);
    }
    
    return descriptions;
  }
  
  // --- Status Checks ---
  
  isCritical(): boolean {
    return this.state.stage >= 5;
  }
  
  isBloodMoon(): boolean {
    return this.state.daysRemaining <= 0;
  }
  
  /**
   * Get stage description for UI
   */
  getStageDescription(): string {
    switch (this.state.stage) {
      case 1:
        return 'The curse whispers at the edge of your mind.';
      case 2:
        return 'Dark veins crawl beneath your skin. Others begin to notice.';
      case 3:
        return 'The transformation accelerates. Reality feels thin.';
      case 4:
        return 'You are becoming something else. Time grows short.';
      case 5:
        return 'The curse consumes you. The blood moon approaches.';
      default:
        return 'The curse marks you.';
    }
  }
  
  // --- Serialization ---
  
  serialize(): CurseState {
    return {
      stage: this.state.stage,
      manifestation: this.state.manifestation,
      daysRemaining: this.state.daysRemaining,
      playstyleScores: { ...this.state.playstyleScores }
    };
  }
  
  static deserialize(data: CurseState): CurseSystem {
    const system = new CurseSystem(data.daysRemaining);
    system.state = {
      stage: data.stage,
      manifestation: data.manifestation,
      daysRemaining: data.daysRemaining,
      playstyleScores: { ...data.playstyleScores }
    };
    return system;
  }
  
  /**
   * Reset for new run
   */
  reset(daysUntilBloodMoon: number = 30): void {
    this.state = {
      stage: 1,
      manifestation: CurseManifestation.BALANCED,
      daysRemaining: daysUntilBloodMoon,
      playstyleScores: {
        combat: 0,
        trade: 0,
        exploration: 0
      }
    };
  }
}

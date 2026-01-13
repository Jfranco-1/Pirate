import { PaleAttentionState } from '../types';

/**
 * Attention threshold effects
 */
export interface AttentionEffects {
  // World effects
  positiveEventModifier: number;   // Multiplier for good random events
  negativeEventModifier: number;   // Multiplier for bad random events
  priceModifier: number;           // All prices affected
  
  // Combat effects
  enemyDamageModifier: number;     // Enemies deal more damage
  playerDamageModifier: number;    // Player deals less damage
  
  // UI effects
  uiCorruptionLevel: number;       // How glitched the UI gets (0-1)
  hallucinationFrequency: number;  // How often false perceptions occur
  
  // Direct intervention
  thrallEncounterChance: number;   // Chance of targeted thrall encounter
  directCommunication: boolean;    // Pale Messenger speaks directly
}

/**
 * PaleAttentionSystem - Tracks how much the Pale Messenger notices you
 * 
 * CRITICAL: This system has PERMANENT consequences.
 * - Attention can decrease, but FLOOR cannot
 * - Floor locks at thresholds (20, 40, 60, 80, 100)
 * - Once you've drawn attention, it NEVER fully goes away
 * 
 * This creates the "Seeking Mr. Eaten's Name" style progression where
 * pursuing forbidden knowledge has lasting, irreversible consequences.
 * 
 * The Pale Messenger:
 * - At low attention: Subtly guides you toward assembling the statue
 * - At medium attention: Actively discourages your investigation
 * - At high attention: Directly intervenes to stop you
 * - At critical attention: All-out assault on your sanity and progress
 */
export class PaleAttentionSystem {
  private state: PaleAttentionState;
  private thresholdCallbacks: Map<number, (() => void)[]>;
  
  constructor(initialState?: PaleAttentionState) {
    this.state = initialState || {
      current: 0,
      floor: 0,
      lastThresholdCrossed: 0
    };
    
    this.thresholdCallbacks = new Map();
    // Initialize callback arrays for each floor threshold
    [20, 40, 60, 80, 100].forEach(threshold => {
      this.thresholdCallbacks.set(threshold, []);
    });
  }
  
  // --- Getters ---
  
  getCurrent(): number {
    return this.state.current;
  }
  
  getFloor(): number {
    return this.state.floor;
  }
  
  /**
   * Get attention level name for UI
   */
  getAttentionLevel(): string {
    const floor = this.state.floor;
    if (floor >= 80) return 'CONDEMNED';
    if (floor >= 60) return 'MARKED';
    if (floor >= 40) return 'HUNTED';
    if (floor >= 20) return 'WATCHED';
    return 'UNKNOWN';
  }
  
  /**
   * Get description of current attention state
   */
  getAttentionDescription(): string {
    const floor = this.state.floor;
    
    if (floor >= 80) {
      return 'The Pale Messenger knows you completely. Every run is a battle for survival.';
    }
    if (floor >= 60) {
      return 'You are marked. The golden gaze follows you across lives.';
    }
    if (floor >= 40) {
      return 'Active forces work against you. Coincidences turn hostile.';
    }
    if (floor >= 20) {
      return 'Something far away has turned its gaze toward you. You are observed.';
    }
    return 'You move through the world unnoticed by cosmic forces.';
  }
  
  // --- Attention Management ---
  
  /**
   * Gain attention (investigating Pale Messenger, destroying signs, etc.)
   * 
   * Common sources:
   * - Reading forbidden texts: +5-15
   * - Destroying Pale Signs: +10
   * - Freeing thralls: +15
   * - Learning binding words: +20
   * - Beginning Severance: +50
   */
  gain(amount: number, source: string): number {
    if (amount <= 0) return this.state.current;
    
    const oldValue = this.state.current;
    this.state.current = Math.min(100, this.state.current + amount);
    
    console.log(`[PaleAttention] +${amount} from "${source}" (${oldValue} → ${this.state.current})`);
    
    // Check for floor threshold locks
    this.checkFloorThresholds(oldValue, this.state.current);
    
    return this.state.current;
  }
  
  /**
   * Reduce attention (lying low, appeasement, purification rituals)
   * 
   * CRITICAL: Can NEVER go below floor
   */
  reduce(amount: number, source: string): number {
    if (amount <= 0) return this.state.current;
    
    const oldValue = this.state.current;
    this.state.current = Math.max(this.state.floor, this.state.current - amount);
    
    const actualReduction = oldValue - this.state.current;
    
    if (actualReduction > 0) {
      console.log(`[PaleAttention] -${actualReduction} from "${source}" (${oldValue} → ${this.state.current})`);
    } else {
      console.log(`[PaleAttention] Cannot reduce below floor (${this.state.floor})`);
    }
    
    return this.state.current;
  }
  
  /**
   * Check and lock floor at thresholds
   * Once a floor is set, it can NEVER be reduced
   */
  private checkFloorThresholds(oldValue: number, newValue: number): void {
    const thresholds = [20, 40, 60, 80, 100];
    
    for (const threshold of thresholds) {
      if (newValue >= threshold && this.state.floor < threshold) {
        // LOCK THE FLOOR - Point of no return
        this.state.floor = threshold;
        this.state.lastThresholdCrossed = threshold;
        
        console.log(`[PaleAttention] FLOOR LOCKED at ${threshold} - This is PERMANENT`);
        
        // Trigger callbacks
        const callbacks = this.thresholdCallbacks.get(threshold) || [];
        callbacks.forEach(cb => cb());
      }
    }
  }
  
  /**
   * Register callback for floor threshold crossing
   */
  onFloorThreshold(threshold: number, callback: () => void): void {
    const callbacks = this.thresholdCallbacks.get(threshold);
    if (callbacks) {
      callbacks.push(callback);
    }
  }
  
  // --- Effects Calculation ---
  
  /**
   * Get all effects based on current attention level
   */
  getEffects(): AttentionEffects {
    const attention = this.state.current;
    const floor = this.state.floor;
    
    // Base effects scale with current attention
    const effects: AttentionEffects = {
      positiveEventModifier: 1 - (attention * 0.005),    // Up to -50%
      negativeEventModifier: 1 + (attention * 0.005),   // Up to +50%
      priceModifier: 1 + (attention * 0.002),           // Up to +20%
      enemyDamageModifier: 1 + (attention * 0.003),     // Up to +30%
      playerDamageModifier: 1 - (attention * 0.003),    // Up to -30%
      uiCorruptionLevel: Math.max(0, (attention - 40) / 60),  // Starts at 40
      hallucinationFrequency: Math.max(0, (attention - 20) / 80),
      thrallEncounterChance: attention * 0.005,         // Up to 50%
      directCommunication: attention >= 80
    };
    
    // Floor-based permanent effects (even when current is reduced)
    if (floor >= 20) {
      effects.positiveEventModifier -= 0.1;  // Permanent -10%
    }
    if (floor >= 40) {
      effects.priceModifier += 0.1;  // Permanent +10%
      effects.thrallEncounterChance += 0.1;
    }
    if (floor >= 60) {
      effects.enemyDamageModifier += 0.15;
      effects.uiCorruptionLevel = Math.max(effects.uiCorruptionLevel, 0.3);
    }
    if (floor >= 80) {
      effects.directCommunication = true;
      effects.negativeEventModifier += 0.25;
    }
    
    return effects;
  }
  
  /**
   * Get list of active penalties for UI display
   */
  getActivePenalties(): string[] {
    const penalties: string[] = [];
    const effects = this.getEffects();
    const floor = this.state.floor;
    
    if (floor >= 20) {
      penalties.push('Observed: Lucky events reduced');
    }
    if (floor >= 40) {
      penalties.push('Hunted: Prices increased, thrall encounters more likely');
    }
    if (floor >= 60) {
      penalties.push('Marked: Combat harder, UI corruption begins');
    }
    if (floor >= 80) {
      penalties.push('Condemned: Direct interference, severe penalties');
    }
    
    if (this.state.current >= 90) {
      penalties.push('CRITICAL: The Pale Messenger speaks directly');
    }
    
    return penalties;
  }
  
  // --- Intervention Events ---
  
  /**
   * Check if Pale Messenger should intervene this turn
   */
  shouldIntervene(): boolean {
    if (this.state.current < 40) return false;
    
    const effects = this.getEffects();
    return Math.random() < effects.thrallEncounterChance;
  }
  
  /**
   * Get type of intervention based on attention level
   */
  getInterventionType(): 'thrall_hint' | 'storm' | 'ambush' | 'mental_attack' | 'direct_speech' {
    const attention = this.state.current;
    
    if (attention >= 90) return 'direct_speech';
    if (attention >= 70) return 'mental_attack';
    if (attention >= 50) return 'ambush';
    if (attention >= 30) return 'storm';
    return 'thrall_hint';
  }
  
  // --- Special Checks ---
  
  /**
   * Check if player has ever discovered the Pale Messenger
   */
  hasDiscoveredPaleMessenger(): boolean {
    return this.state.floor >= 20;
  }
  
  /**
   * Check if this is a "point of no return" run
   */
  isPastPointOfNoReturn(): boolean {
    return this.state.floor >= 60;
  }
  
  /**
   * Check if player is condemned (hardest mode)
   */
  isCondemned(): boolean {
    return this.state.floor >= 80;
  }
  
  // --- Serialization ---
  
  serialize(): PaleAttentionState {
    return {
      current: this.state.current,
      floor: this.state.floor,
      lastThresholdCrossed: this.state.lastThresholdCrossed
    };
  }
  
  static deserialize(data: PaleAttentionState): PaleAttentionSystem {
    return new PaleAttentionSystem(data);
  }
  
  /**
   * Reset current attention to floor (new run)
   * Floor NEVER resets
   */
  resetToFloor(): void {
    console.log(`[PaleAttention] New run - attention reset to floor (${this.state.floor})`);
    this.state.current = this.state.floor;
  }
}

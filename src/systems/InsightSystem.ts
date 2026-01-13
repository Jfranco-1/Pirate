import { InsightState, InsightThreshold, InsightEvent } from '../types';

/**
 * InsightSystem - Tracks player's understanding of cosmic truths
 * 
 * Insight determines what the player can perceive:
 * - Hidden passages in ships
 * - NPC allegiances (thrall markers)
 * - True nature of cosmic entities
 * - Secret lore and forbidden knowledge
 * 
 * Threshold levels:
 * - IGNORANCE (0-29): Surface level, believe the obvious narrative
 * - SUSPICION (30-49): Start noticing patterns, yellow-gold motifs
 * - UNDERSTANDING (50-69): Structural awareness, see thrall behaviors
 * - TRUE_SIGHT (70-89): See hidden passages, NPC auras, cosmic influences
 * - TRANSCENDENCE (90-100): Reality layers, past/future visions, direct entity perception
 */
export class InsightSystem {
  private state: InsightState;
  private thresholdCallbacks: Map<InsightThreshold, (() => void)[]>;
  
  constructor(initialInsight: number = 0) {
    this.state = {
      current: Math.max(0, Math.min(100, initialInsight)),
      history: []
    };
    this.thresholdCallbacks = new Map();
    
    // Initialize callback arrays for each threshold
    this.thresholdCallbacks.set(InsightThreshold.SUSPICION, []);
    this.thresholdCallbacks.set(InsightThreshold.UNDERSTANDING, []);
    this.thresholdCallbacks.set(InsightThreshold.TRUE_SIGHT, []);
    this.thresholdCallbacks.set(InsightThreshold.TRANSCENDENCE, []);
  }
  
  /**
   * Get current insight level (0-100)
   */
  getCurrent(): number {
    return this.state.current;
  }
  
  /**
   * Get the name of current threshold level
   */
  getThresholdLevel(): string {
    if (this.state.current >= InsightThreshold.TRANSCENDENCE) return 'TRANSCENDENCE';
    if (this.state.current >= InsightThreshold.TRUE_SIGHT) return 'TRUE_SIGHT';
    if (this.state.current >= InsightThreshold.UNDERSTANDING) return 'UNDERSTANDING';
    if (this.state.current >= InsightThreshold.SUSPICION) return 'SUSPICION';
    return 'IGNORANCE';
  }
  
  /**
   * Get descriptive text for current insight level
   */
  getThresholdDescription(): string {
    switch (this.getThresholdLevel()) {
      case 'TRANSCENDENCE':
        return 'Reality bends around you. You see what should not be seen.';
      case 'TRUE_SIGHT':
        return 'The masks slip. You perceive the hidden truths.';
      case 'UNDERSTANDING':
        return 'Patterns emerge from chaos. You begin to understand.';
      case 'SUSPICION':
        return 'Something feels wrong. The golden light seems... sickly.';
      default:
        return 'Blissful ignorance. The world seems normal.';
    }
  }
  
  /**
   * Check if current insight meets or exceeds a threshold
   */
  meetsThreshold(threshold: InsightThreshold): boolean {
    return this.state.current >= threshold;
  }
  
  /**
   * Gain insight from various sources
   * 
   * Common sources and amounts:
   * - Reading lore texts: +5-15
   * - Examining statue pieces: +15
   * - Curse stage progression: +10 per stage
   * - Eldritch encounters: +5-20
   * - Monastery revelations: +10-30
   * - Consuming visions (drugs/rituals): +20-40 (dangerous)
   */
  gain(amount: number, source: string): number {
    if (amount <= 0) return this.state.current;
    
    const oldInsight = this.state.current;
    this.state.current = Math.min(100, this.state.current + amount);
    
    // Record the event for journal/history
    this.state.history.push({
      source,
      amount,
      timestamp: Date.now()
    });
    
    // Check for threshold crossings and trigger callbacks
    this.checkThresholds(oldInsight, this.state.current);
    
    console.log(`[Insight] +${amount} from "${source}" (${oldInsight} → ${this.state.current})`);
    
    return this.state.current;
  }
  
  /**
   * Lose insight (rare - memory wipe, denial, alcohol)
   * Note: Cannot go below 0, and some losses are temporary
   */
  lose(amount: number, source: string): number {
    if (amount <= 0) return this.state.current;
    
    const oldInsight = this.state.current;
    this.state.current = Math.max(0, this.state.current - amount);
    
    this.state.history.push({
      source: `LOSS: ${source}`,
      amount: -amount,
      timestamp: Date.now()
    });
    
    console.log(`[Insight] -${amount} from "${source}" (${oldInsight} → ${this.state.current})`);
    
    return this.state.current;
  }
  
  /**
   * Register a callback to fire when crossing a threshold
   * Useful for triggering narrative events, UI changes, etc.
   */
  onThreshold(threshold: InsightThreshold, callback: () => void): void {
    const callbacks = this.thresholdCallbacks.get(threshold);
    if (callbacks) {
      callbacks.push(callback);
    }
  }
  
  /**
   * Check for threshold crossings and fire appropriate callbacks
   */
  private checkThresholds(oldValue: number, newValue: number): void {
    const thresholds = [
      InsightThreshold.SUSPICION,
      InsightThreshold.UNDERSTANDING,
      InsightThreshold.TRUE_SIGHT,
      InsightThreshold.TRANSCENDENCE
    ];
    
    for (const threshold of thresholds) {
      if (oldValue < threshold && newValue >= threshold) {
        console.log(`[Insight] Crossed threshold: ${InsightThreshold[threshold]}`);
        
        const callbacks = this.thresholdCallbacks.get(threshold) || [];
        callbacks.forEach(cb => {
          try {
            cb();
          } catch (error) {
            console.error(`[Insight] Callback error at threshold ${threshold}:`, error);
          }
        });
      }
    }
  }
  
  /**
   * Get insight history for journal display
   */
  getHistory(): InsightEvent[] {
    return [...this.state.history];
  }
  
  /**
   * Get recent insight events (last N)
   */
  getRecentHistory(count: number = 5): InsightEvent[] {
    return this.state.history.slice(-count);
  }
  
  /**
   * Check if a tile/element should be visible at current insight
   */
  canSee(insightRequired: InsightThreshold): boolean {
    return this.meetsThreshold(insightRequired);
  }
  
  /**
   * Serialize state for saving
   */
  serialize(): InsightState {
    return {
      current: this.state.current,
      history: [...this.state.history]
    };
  }
  
  /**
   * Create instance from saved state
   */
  static deserialize(data: InsightState): InsightSystem {
    const system = new InsightSystem(data.current);
    system.state.history = [...data.history];
    return system;
  }
  
  /**
   * Reset for new run (keeps nothing - insight is per-character)
   */
  reset(startingInsight: number = 0): void {
    this.state = {
      current: Math.max(0, Math.min(100, startingInsight)),
      history: []
    };
  }
}

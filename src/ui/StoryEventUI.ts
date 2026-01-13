import Phaser from 'phaser';
import { StoryEvent, StoryEventOption, EventType } from '../systems/StoryEventSystem';

/**
 * StoryEventUI - Displays story events as modal popups
 */
export class StoryEventUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  
  // UI elements
  private background!: Phaser.GameObjects.Rectangle;
  private panel!: Phaser.GameObjects.Rectangle;
  private titleText!: Phaser.GameObjects.Text;
  private descriptionText!: Phaser.GameObjects.Text;
  private optionButtons: Phaser.GameObjects.Container[] = [];
  private resultPanel!: Phaser.GameObjects.Container;
  private moodVignette!: Phaser.GameObjects.Rectangle;
  
  // State
  private currentEvent: StoryEvent | null = null;
  private isVisible = false;
  private onCompleteCallback?: (effects: StoryEventOption['effects']) => void;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    
    this.container = scene.add.container(0, 0);
    this.container.setDepth(1950);
    this.container.setVisible(false);
    
    this.createUI();
  }
  
  private createUI(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Mood vignette (covers whole screen)
    this.moodVignette = this.scene.add.rectangle(
      width / 2, height / 2,
      width, height,
      0x000000, 0.8
    );
    this.container.add(this.moodVignette);
    
    // Main panel
    this.panel = this.scene.add.rectangle(
      width / 2, height / 2,
      650, 480,
      0x1a1520, 0.98
    );
    this.panel.setStrokeStyle(3, 0x4a3050);
    this.container.add(this.panel);
    
    // Decorative border
    const innerBorder = this.scene.add.rectangle(
      width / 2, height / 2,
      630, 460,
      0x000000, 0
    );
    innerBorder.setStrokeStyle(1, 0x3a2535);
    this.container.add(innerBorder);
    
    // Title
    this.titleText = this.scene.add.text(
      width / 2, height / 2 - 200,
      '',
      {
        fontSize: '22px',
        color: '#c9a227',
        fontStyle: 'bold'
      }
    );
    this.titleText.setOrigin(0.5);
    this.container.add(this.titleText);
    
    // Description text
    this.descriptionText = this.scene.add.text(
      width / 2 - 290, height / 2 - 160,
      '',
      {
        fontSize: '14px',
        color: '#c0c0c0',
        lineSpacing: 5,
        wordWrap: { width: 580 }
      }
    );
    this.container.add(this.descriptionText);
    
    // Result panel (hidden initially)
    this.resultPanel = this.scene.add.container(width / 2, height / 2);
    this.resultPanel.setVisible(false);
    this.container.add(this.resultPanel);
  }
  
  /**
   * Show a story event
   */
  showEvent(event: StoryEvent, onComplete?: (effects: StoryEventOption['effects']) => void): void {
    this.currentEvent = event;
    this.onCompleteCallback = onComplete;
    
    // Clear previous options
    this.clearOptions();
    this.resultPanel.setVisible(false);
    
    // Apply mood styling
    this.applyMoodStyle(event.mood);
    
    // Set content
    this.titleText.setText(this.getEventIcon(event.type) + ' ' + event.title);
    this.descriptionText.setText(event.description);
    
    // Create option buttons
    this.createOptionButtons(event.options);
    
    // Show container
    this.container.setVisible(true);
    this.isVisible = true;
    
    // Animate in
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 400,
      ease: 'Power2'
    });
  }
  
  /**
   * Apply mood-based visual styling
   */
  private applyMoodStyle(mood: StoryEvent['mood']): void {
    let vignetteColor: number;
    let vignetteAlpha: number;
    let borderColor: number;
    
    switch (mood) {
      case 'warning':
        vignetteColor = 0x302010;
        vignetteAlpha = 0.85;
        borderColor = 0x8b6914;
        break;
      case 'mysterious':
        vignetteColor = 0x101030;
        vignetteAlpha = 0.85;
        borderColor = 0x6060aa;
        break;
      case 'horror':
        vignetteColor = 0x200000;
        vignetteAlpha = 0.9;
        borderColor = 0x8b0000;
        // Add pulse effect
        this.scene.tweens.add({
          targets: this.moodVignette,
          alpha: 0.7,
          duration: 1500,
          yoyo: true,
          repeat: -1,
          ease: 'Sine.easeInOut'
        });
        break;
      case 'hope':
        vignetteColor = 0x102010;
        vignetteAlpha = 0.8;
        borderColor = 0x40a040;
        break;
      default:
        vignetteColor = 0x000000;
        vignetteAlpha = 0.8;
        borderColor = 0x4a3050;
    }
    
    this.moodVignette.setFillStyle(vignetteColor, vignetteAlpha);
    this.panel.setStrokeStyle(3, borderColor);
  }
  
  /**
   * Get icon for event type
   */
  private getEventIcon(type: EventType): string {
    switch (type) {
      case EventType.DISCOVERY: return '🔍';
      case EventType.ENCOUNTER: return '👤';
      case EventType.CHOICE: return '⚖️';
      case EventType.OMEN: return '👁️';
      case EventType.INTERFERENCE: return '⚠️';
      case EventType.MEMORY: return '💭';
      default: return '📜';
    }
  }
  
  /**
   * Create option buttons
   */
  private createOptionButtons(options: StoryEventOption[]): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    let y = height / 2 + 80;
    
    for (let i = 0; i < options.length; i++) {
      const option = options[i];
      const btn = this.createOptionButton(option, width / 2, y, i + 1);
      this.container.add(btn);
      this.optionButtons.push(btn);
      y += 50;
      
      // Animate in with delay
      btn.setAlpha(0);
      this.scene.tweens.add({
        targets: btn,
        alpha: 1,
        delay: 400 + i * 150,
        duration: 300
      });
    }
  }
  
  /**
   * Create a single option button
   */
  private createOptionButton(
    option: StoryEventOption, 
    x: number, 
    y: number,
    number: number
  ): Phaser.GameObjects.Container {
    const btn = this.scene.add.container(x, y);
    
    const bg = this.scene.add.rectangle(0, 0, 580, 42, 0x252035);
    bg.setStrokeStyle(1, 0x4a3050);
    btn.add(bg);
    
    // Number indicator
    const numText = this.scene.add.text(-270, 0, `${number}.`, {
      fontSize: '14px',
      color: '#808080'
    });
    numText.setOrigin(0, 0.5);
    btn.add(numText);
    
    // Option text
    const displayText = option.text.length > 65 
      ? option.text.substring(0, 62) + '...' 
      : option.text;
    
    const text = this.scene.add.text(-240, 0, displayText, {
      fontSize: '14px',
      color: '#c0c0c0'
    });
    text.setOrigin(0, 0.5);
    btn.add(text);
    
    // Effects preview (small icons)
    const effectsStr = this.getEffectsPreview(option.effects);
    if (effectsStr) {
      const effectsText = this.scene.add.text(260, 0, effectsStr, {
        fontSize: '11px',
        color: '#808080'
      });
      effectsText.setOrigin(1, 0.5);
      btn.add(effectsText);
    }
    
    // Interactivity
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      bg.setFillStyle(0x353045);
      text.setColor('#ffffff');
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(0x252035);
      text.setColor('#c0c0c0');
    });
    bg.on('pointerdown', () => {
      this.selectOption(option);
    });
    
    return btn;
  }
  
  /**
   * Get preview text for effects
   */
  private getEffectsPreview(effects: StoryEventOption['effects']): string {
    const parts: string[] = [];
    
    if (effects.insightGain) parts.push(`+${effects.insightGain}👁️`);
    if (effects.paleAttentionGain) parts.push(`+${effects.paleAttentionGain}⚠️`);
    if (effects.currencyGain) parts.push(`+${effects.currencyGain}🪙`);
    if (effects.currencyCost) parts.push(`-${effects.currencyCost}🪙`);
    if (effects.healthGain) parts.push(`+${effects.healthGain}❤️`);
    if (effects.healthCost) parts.push(`-${effects.healthCost}❤️`);
    
    return parts.join(' ');
  }
  
  /**
   * Handle option selection
   */
  private selectOption(option: StoryEventOption): void {
    // Hide option buttons
    for (const btn of this.optionButtons) {
      this.scene.tweens.add({
        targets: btn,
        alpha: 0,
        duration: 200
      });
    }
    
    // Show result
    this.showResult(option);
    
    // Trigger callback with effects
    if (this.onCompleteCallback) {
      this.onCompleteCallback(option.effects);
    }
  }
  
  /**
   * Show the result of a choice
   */
  private showResult(option: StoryEventOption): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Clear result panel
    this.resultPanel.removeAll(true);
    
    // Result background
    const resultBg = this.scene.add.rectangle(0, 60, 580, 150, 0x1a1a25);
    resultBg.setStrokeStyle(1, 0x3a3a45);
    this.resultPanel.add(resultBg);
    
    // Result text
    const resultText = this.scene.add.text(-270, 0, option.resultText, {
      fontSize: '14px',
      color: '#a0a0a0',
      lineSpacing: 4,
      wordWrap: { width: 540 }
    });
    resultText.setOrigin(0, 0);
    this.resultPanel.add(resultText);
    
    // Effects summary
    const effectsY = 100;
    let effectsStr = '';
    
    if (option.effects.insightGain) {
      effectsStr += `+${option.effects.insightGain} Insight  `;
    }
    if (option.effects.paleAttentionGain) {
      effectsStr += `⚠️ +${option.effects.paleAttentionGain} Pale Attention  `;
    }
    if (option.effects.currencyGain) {
      effectsStr += `+${option.effects.currencyGain} Doubloons  `;
    }
    if (option.effects.currencyCost) {
      effectsStr += `-${option.effects.currencyCost} Doubloons  `;
    }
    if (option.effects.healthGain) {
      effectsStr += `+${option.effects.healthGain} HP  `;
    }
    if (option.effects.healthCost) {
      effectsStr += `-${option.effects.healthCost} HP  `;
    }
    if (option.effects.curseAdvance) {
      effectsStr += `☠️ Curse Advanced  `;
    }
    
    if (effectsStr) {
      const effectsText = this.scene.add.text(0, effectsY, effectsStr.trim(), {
        fontSize: '12px',
        color: '#6080a0'
      });
      effectsText.setOrigin(0.5);
      this.resultPanel.add(effectsText);
    }
    
    // Continue button
    const continueBtn = this.scene.add.rectangle(0, 150, 150, 40, 0x3a3050);
    continueBtn.setStrokeStyle(2, 0x5a4070);
    continueBtn.setInteractive({ useHandCursor: true });
    continueBtn.on('pointerover', () => continueBtn.setFillStyle(0x4a4060));
    continueBtn.on('pointerout', () => continueBtn.setFillStyle(0x3a3050));
    continueBtn.on('pointerdown', () => this.hide());
    this.resultPanel.add(continueBtn);
    
    const continueText = this.scene.add.text(0, 150, 'Continue', {
      fontSize: '16px',
      color: '#c0c0c0'
    });
    continueText.setOrigin(0.5);
    this.resultPanel.add(continueText);
    
    // Show with animation
    this.resultPanel.setAlpha(0);
    this.resultPanel.setVisible(true);
    this.scene.tweens.add({
      targets: this.resultPanel,
      alpha: 1,
      delay: 300,
      duration: 400
    });
  }
  
  /**
   * Clear option buttons
   */
  private clearOptions(): void {
    for (const btn of this.optionButtons) {
      btn.destroy();
    }
    this.optionButtons = [];
  }
  
  /**
   * Hide the event UI
   */
  hide(): void {
    // Stop any tweens
    this.scene.tweens.killTweensOf(this.moodVignette);
    
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.container.setVisible(false);
        this.isVisible = false;
        this.clearOptions();
        this.currentEvent = null;
      }
    });
  }
  
  isShowing(): boolean {
    return this.isVisible;
  }
  
  destroy(): void {
    this.container.destroy();
  }
}

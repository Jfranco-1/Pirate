import Phaser from 'phaser';
import { DialogueSystem, DialogueNode, DialogueResponse, NPCType } from '../systems/DialogueSystem';

/**
 * DialogueUI - Displays NPC conversations
 */
export class DialogueUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private dialogueSystem: DialogueSystem;
  
  // UI elements
  private background!: Phaser.GameObjects.Rectangle;
  private npcNameText!: Phaser.GameObjects.Text;
  private dialogueText!: Phaser.GameObjects.Text;
  private responseButtons: Phaser.GameObjects.Container[] = [];
  private portrait!: Phaser.GameObjects.Rectangle;
  private moodIndicator!: Phaser.GameObjects.Rectangle;
  
  // State
  private currentNode: DialogueNode | null = null;
  private isVisible = false;
  private onCloseCallback?: () => void;
  private onEffectsCallback?: (effects: DialogueNode['effects']) => void;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.dialogueSystem = new DialogueSystem();
    
    this.container = scene.add.container(0, 0);
    this.container.setDepth(1800);
    this.container.setVisible(false);
    
    this.createUI();
  }
  
  private createUI(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Semi-transparent backdrop
    const backdrop = this.scene.add.rectangle(
      width / 2, height / 2,
      width, height,
      0x000000, 0.6
    );
    this.container.add(backdrop);
    
    // Main dialogue box at bottom of screen
    this.background = this.scene.add.rectangle(
      width / 2, height - 140,
      width - 80, 240,
      0x1a1015, 0.95
    );
    this.background.setStrokeStyle(3, 0x4a3040);
    this.container.add(this.background);
    
    // NPC portrait area
    this.portrait = this.scene.add.rectangle(
      80, height - 180,
      100, 120,
      0x2a2030
    );
    this.portrait.setStrokeStyle(2, 0x5a4060);
    this.container.add(this.portrait);
    
    // Mood indicator strip
    this.moodIndicator = this.scene.add.rectangle(
      80, height - 115,
      100, 8,
      0x808080
    );
    this.container.add(this.moodIndicator);
    
    // NPC name
    this.npcNameText = this.scene.add.text(
      150, height - 240,
      '',
      {
        fontSize: '18px',
        color: '#c0a080',
        fontStyle: 'bold'
      }
    );
    this.container.add(this.npcNameText);
    
    // Dialogue text area
    this.dialogueText = this.scene.add.text(
      150, height - 210,
      '',
      {
        fontSize: '15px',
        color: '#d0d0d0',
        lineSpacing: 4,
        wordWrap: { width: width - 200 }
      }
    );
    this.container.add(this.dialogueText);
  }
  
  /**
   * Start a dialogue with an NPC
   */
  startDialogue(
    npcType: NPCType,
    insight: number,
    paleAttention: number,
    curseStage: number,
    playerClass: any,
    onClose?: () => void,
    onEffects?: (effects: DialogueNode['effects']) => void
  ): boolean {
    // Update dialogue system context
    this.dialogueSystem.setContext(insight, paleAttention, curseStage, playerClass);
    
    // Get best dialogue for this NPC
    const node = this.dialogueSystem.getBestDialogue(npcType);
    if (!node) {
      console.log(`[DIALOGUE] No available dialogue for ${npcType}`);
      return false;
    }
    
    this.onCloseCallback = onClose;
    this.onEffectsCallback = onEffects;
    
    this.showNode(node);
    return true;
  }
  
  /**
   * Show a specific dialogue node
   */
  private showNode(node: DialogueNode): void {
    this.currentNode = node;
    
    // Clear previous responses
    this.clearResponses();
    
    // Update NPC name
    this.npcNameText.setText(this.getNPCDisplayName(node.npcType));
    
    // Update dialogue text with typewriter effect
    this.typewriterText(node.text);
    
    // Update portrait color based on NPC type
    this.updatePortrait(node.npcType);
    
    // Update mood indicator
    this.updateMoodIndicator(node.mood);
    
    // Show responses after text finishes
    this.scene.time.delayedCall(node.text.length * 20 + 500, () => {
      this.showResponses(node);
    });
    
    // Apply effects
    if (node.effects && this.onEffectsCallback) {
      this.onEffectsCallback(node.effects);
    }
    
    this.container.setVisible(true);
    this.isVisible = true;
    
    // Animate in
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 300
    });
  }
  
  /**
   * Typewriter text effect
   */
  private typewriterText(fullText: string): void {
    let currentText = '';
    let index = 0;
    
    const timer = this.scene.time.addEvent({
      delay: 20,
      repeat: fullText.length - 1,
      callback: () => {
        currentText += fullText[index];
        this.dialogueText.setText(currentText);
        index++;
      }
    });
  }
  
  /**
   * Show response options
   */
  private showResponses(node: DialogueNode): void {
    const responses = this.dialogueSystem.getAvailableResponses(node);
    const height = this.scene.cameras.main.height;
    
    if (responses.length === 0) {
      // No responses - show close button
      this.createResponseButton('[Continue]', height - 70, () => {
        this.hide();
      });
      return;
    }
    
    let y = height - 70 - (responses.length - 1) * 30;
    
    for (const response of responses) {
      this.createResponseButton(response.text, y, () => {
        this.handleResponse(response);
      });
      y += 35;
    }
  }
  
  /**
   * Create a response button
   */
  private createResponseButton(text: string, y: number, onClick: () => void): void {
    const width = this.scene.cameras.main.width;
    const btn = this.scene.add.container(width / 2, y);
    
    const bg = this.scene.add.rectangle(0, 0, width - 200, 30, 0x2a2035);
    bg.setStrokeStyle(1, 0x4a3050);
    btn.add(bg);
    
    const displayText = text.length > 70 ? text.substring(0, 67) + '...' : text;
    const textObj = this.scene.add.text(-(width - 220) / 2, 0, `▸ ${displayText}`, {
      fontSize: '13px',
      color: '#a0a0a0'
    });
    textObj.setOrigin(0, 0.5);
    btn.add(textObj);
    
    // Interactivity
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      bg.setFillStyle(0x3a3045);
      textObj.setColor('#ffffff');
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(0x2a2035);
      textObj.setColor('#a0a0a0');
    });
    bg.on('pointerdown', onClick);
    
    this.container.add(btn);
    this.responseButtons.push(btn);
    
    // Fade in
    btn.setAlpha(0);
    this.scene.tweens.add({
      targets: btn,
      alpha: 1,
      duration: 200
    });
  }
  
  /**
   * Handle player response selection
   */
  private handleResponse(response: DialogueResponse): void {
    // Apply response effects
    if (response.effects && this.onEffectsCallback) {
      this.onEffectsCallback(response.effects as any);
    }
    
    // Chain to next dialogue if specified
    if (response.nextNodeId) {
      const nextNode = this.dialogueSystem.getDialogueNode(response.nextNodeId);
      if (nextNode) {
        this.showNode(nextNode);
        return;
      }
    }
    
    // Close dialogue
    this.hide();
  }
  
  /**
   * Clear response buttons
   */
  private clearResponses(): void {
    for (const btn of this.responseButtons) {
      btn.destroy();
    }
    this.responseButtons = [];
  }
  
  /**
   * Update NPC portrait
   */
  private updatePortrait(npcType: NPCType): void {
    let color: number;
    
    switch (npcType) {
      case NPCType.TAVERN_KEEPER:
        color = 0x6a4a30;
        break;
      case NPCType.MONASTERY_MONK:
        color = 0x4a4a6a;
        break;
      case NPCType.ARMADA_OFFICER:
        color = 0x8b6914;
        break;
      case NPCType.MERCHANT:
        color = 0x4a6a4a;
        break;
      case NPCType.DROWNED_ENVOY:
        color = 0x206060;
        break;
      case NPCType.MYSTERIOUS_STRANGER:
        color = 0x3a3a30;
        break;
      case NPCType.FATHER_SHADE:
        color = 0x4a4a6a;
        break;
      default:
        color = 0x404040;
    }
    
    this.portrait.setFillStyle(color);
  }
  
  /**
   * Update mood indicator
   */
  private updateMoodIndicator(mood?: DialogueNode['mood']): void {
    let color: number;
    
    switch (mood) {
      case 'warning':
        color = 0xffaa00;
        break;
      case 'hostile':
        color = 0xff4444;
        break;
      case 'friendly':
        color = 0x44ff44;
        break;
      case 'cryptic':
        color = 0xaa88ff;
        break;
      case 'corrupted':
        color = 0xffcc00;
        // Add pulse effect for corrupted
        this.scene.tweens.add({
          targets: this.moodIndicator,
          alpha: 0.5,
          duration: 500,
          yoyo: true,
          repeat: -1
        });
        break;
      default:
        color = 0x808080;
    }
    
    this.moodIndicator.setFillStyle(color);
  }
  
  /**
   * Get display name for NPC type
   */
  private getNPCDisplayName(npcType: NPCType): string {
    switch (npcType) {
      case NPCType.TAVERN_KEEPER: return '🍺 Tavern Keeper';
      case NPCType.MONASTERY_MONK: return '⚖️ Monastery Monk';
      case NPCType.ARMADA_OFFICER: return '⚓ Armada Officer';
      case NPCType.MERCHANT: return '💰 Merchant';
      case NPCType.DROWNED_ENVOY: return '🌊 Drowned Envoy';
      case NPCType.MYSTERIOUS_STRANGER: return '❓ Mysterious Stranger';
      case NPCType.FATHER_SHADE: return '👻 Father\'s Shade';
      case NPCType.CREW_MEMBER: return '🏴‍☠️ Crew Member';
      default: return 'Unknown';
    }
  }
  
  /**
   * Hide the dialogue UI
   */
  hide(): void {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.container.setVisible(false);
        this.isVisible = false;
        this.clearResponses();
        
        if (this.onCloseCallback) {
          this.onCloseCallback();
        }
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

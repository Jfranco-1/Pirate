import Phaser from 'phaser';
import { InsightSystem } from '../systems/InsightSystem';
import { CurseSystem } from '../systems/CurseSystem';
import { InsightThreshold } from '../types';

/**
 * CurseInsightPanel - UI component showing curse and insight status
 * 
 * Displays:
 * - Curse stage (1-5) with visual intensity
 * - Days until blood moon
 * - Insight level with threshold indicator
 * - Curse manifestation type
 */
export class CurseInsightPanel {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  
  // UI elements
  private panel: Phaser.GameObjects.Graphics;
  private curseBar: Phaser.GameObjects.Graphics;
  private insightBar: Phaser.GameObjects.Graphics;
  private curseText: Phaser.GameObjects.Text;
  private insightText: Phaser.GameObjects.Text;
  private daysText: Phaser.GameObjects.Text;
  private manifestationText: Phaser.GameObjects.Text;
  
  // Pulse animation for critical curse
  private pulseTween: Phaser.Tweens.Tween | null = null;
  
  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.container = scene.add.container(x, y);
    this.container.setDepth(600);
    
    // Create panel background
    this.panel = scene.add.graphics();
    this.panel.fillStyle(0x000000, 0.8);
    this.panel.fillRoundedRect(0, 0, 180, 110, 8);
    this.panel.lineStyle(2, 0x444444);
    this.panel.strokeRoundedRect(0, 0, 180, 110, 8);
    this.container.add(this.panel);
    
    // Title
    const title = scene.add.text(90, 8, '⚓ CURSE STATUS', {
      fontSize: '11px',
      color: '#888888',
      fontStyle: 'bold'
    }).setOrigin(0.5, 0);
    this.container.add(title);
    
    // Curse bar background
    this.curseBar = scene.add.graphics();
    this.container.add(this.curseBar);
    
    // Curse label and text
    const curseLabel = scene.add.text(10, 26, 'Curse:', {
      fontSize: '10px',
      color: '#aa4444'
    });
    this.container.add(curseLabel);
    
    this.curseText = scene.add.text(170, 26, 'Stage 1', {
      fontSize: '10px',
      color: '#ff6666'
    }).setOrigin(1, 0);
    this.container.add(this.curseText);
    
    // Insight bar background
    this.insightBar = scene.add.graphics();
    this.container.add(this.insightBar);
    
    // Insight label and text
    const insightLabel = scene.add.text(10, 56, 'Insight:', {
      fontSize: '10px',
      color: '#4488aa'
    });
    this.container.add(insightLabel);
    
    this.insightText = scene.add.text(170, 56, '0%', {
      fontSize: '10px',
      color: '#66aaff'
    }).setOrigin(1, 0);
    this.container.add(this.insightText);
    
    // Days remaining
    this.daysText = scene.add.text(10, 82, '🌙 30 days remain', {
      fontSize: '10px',
      color: '#cc8844'
    });
    this.container.add(this.daysText);
    
    // Manifestation type
    this.manifestationText = scene.add.text(170, 82, '', {
      fontSize: '9px',
      color: '#888888'
    }).setOrigin(1, 0);
    this.container.add(this.manifestationText);
    
    // Initial render
    this.drawBars(1, 0);
  }
  
  /**
   * Update the panel with current curse and insight values
   */
  update(curse: CurseSystem, insight: InsightSystem): void {
    const curseStage = curse.getStage();
    const insightLevel = insight.getCurrent();
    const daysRemaining = curse.getDaysRemaining();
    const manifestation = curse.getManifestationName();
    
    // Update texts
    this.curseText.setText(`Stage ${curseStage}/5`);
    this.insightText.setText(`${insightLevel}%`);
    this.manifestationText.setText(manifestation);
    
    // Update days with color coding
    if (daysRemaining <= 7) {
      this.daysText.setText(`🌑 ${daysRemaining} DAYS!`);
      this.daysText.setColor('#ff4444');
    } else if (daysRemaining <= 14) {
      this.daysText.setText(`🌘 ${daysRemaining} days`);
      this.daysText.setColor('#ffaa44');
    } else {
      this.daysText.setText(`🌙 ${daysRemaining} days remain`);
      this.daysText.setColor('#cc8844');
    }
    
    // Update insight text color based on threshold
    const thresholdLevel = insight.getThresholdLevel();
    switch (thresholdLevel) {
      case 'TRANSCENDENCE':
        this.insightText.setColor('#ff00ff');
        break;
      case 'TRUE_SIGHT':
        this.insightText.setColor('#00ffff');
        break;
      case 'UNDERSTANDING':
        this.insightText.setColor('#00ff88');
        break;
      case 'SUSPICION':
        this.insightText.setColor('#88ff00');
        break;
      default:
        this.insightText.setColor('#66aaff');
    }
    
    // Redraw bars
    this.drawBars(curseStage, insightLevel);
    
    // Pulse effect for critical curse
    if (curseStage >= 4 && !this.pulseTween) {
      this.startPulse();
    } else if (curseStage < 4 && this.pulseTween) {
      this.stopPulse();
    }
  }
  
  /**
   * Draw the curse and insight progress bars
   */
  private drawBars(curseStage: number, insightLevel: number): void {
    // Clear previous
    this.curseBar.clear();
    this.insightBar.clear();
    
    const barWidth = 160;
    const barHeight = 12;
    const barX = 10;
    
    // Curse bar (stage 1-5)
    const curseY = 38;
    const curseProgress = curseStage / 5;
    
    // Background
    this.curseBar.fillStyle(0x331111, 1);
    this.curseBar.fillRoundedRect(barX, curseY, barWidth, barHeight, 4);
    
    // Progress (color based on stage)
    const curseColors = [0x882222, 0xaa3333, 0xcc4444, 0xff4444, 0xff0000];
    this.curseBar.fillStyle(curseColors[curseStage - 1] || 0x882222, 1);
    this.curseBar.fillRoundedRect(barX, curseY, barWidth * curseProgress, barHeight, 4);
    
    // Stage markers
    this.curseBar.fillStyle(0x000000, 0.5);
    for (let i = 1; i < 5; i++) {
      this.curseBar.fillRect(barX + (barWidth * i / 5) - 1, curseY, 2, barHeight);
    }
    
    // Insight bar (0-100)
    const insightY = 68;
    const insightProgress = insightLevel / 100;
    
    // Background
    this.insightBar.fillStyle(0x112233, 1);
    this.insightBar.fillRoundedRect(barX, insightY, barWidth, barHeight, 4);
    
    // Progress (color based on threshold)
    let insightColor = 0x224488;
    if (insightLevel >= InsightThreshold.TRANSCENDENCE) {
      insightColor = 0xff00ff;
    } else if (insightLevel >= InsightThreshold.TRUE_SIGHT) {
      insightColor = 0x00ffff;
    } else if (insightLevel >= InsightThreshold.UNDERSTANDING) {
      insightColor = 0x00ff88;
    } else if (insightLevel >= InsightThreshold.SUSPICION) {
      insightColor = 0x88ff00;
    }
    
    this.insightBar.fillStyle(insightColor, 1);
    this.insightBar.fillRoundedRect(barX, insightY, barWidth * insightProgress, barHeight, 4);
    
    // Threshold markers
    this.insightBar.fillStyle(0xffffff, 0.3);
    const thresholds = [30, 50, 70, 90];
    for (const t of thresholds) {
      this.insightBar.fillRect(barX + (barWidth * t / 100) - 1, insightY, 2, barHeight);
    }
  }
  
  /**
   * Start pulsing animation for critical curse
   */
  private startPulse(): void {
    this.pulseTween = this.scene.tweens.add({
      targets: this.panel,
      alpha: 0.6,
      duration: 500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    // Red tint on panel
    this.panel.clear();
    this.panel.fillStyle(0x330000, 0.8);
    this.panel.fillRoundedRect(0, 0, 180, 110, 8);
    this.panel.lineStyle(2, 0xff4444);
    this.panel.strokeRoundedRect(0, 0, 180, 110, 8);
  }
  
  /**
   * Stop pulsing animation
   */
  private stopPulse(): void {
    if (this.pulseTween) {
      this.pulseTween.stop();
      this.pulseTween = null;
    }
    
    this.panel.setAlpha(1);
    this.panel.clear();
    this.panel.fillStyle(0x000000, 0.8);
    this.panel.fillRoundedRect(0, 0, 180, 110, 8);
    this.panel.lineStyle(2, 0x444444);
    this.panel.strokeRoundedRect(0, 0, 180, 110, 8);
  }
  
  /**
   * Show insight gain notification
   */
  showInsightGain(amount: number, source: string): void {
    const text = this.scene.add.text(
      this.container.x + 90,
      this.container.y + 110,
      `+${amount} Insight`,
      {
        fontSize: '12px',
        color: '#00ffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(700);
    
    this.scene.tweens.add({
      targets: text,
      y: text.y - 30,
      alpha: 0,
      duration: 1500,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }
  
  /**
   * Show curse stage increase notification
   */
  showCurseIncrease(newStage: number): void {
    const text = this.scene.add.text(
      this.container.x + 90,
      this.container.y - 20,
      `CURSE INTENSIFIES: Stage ${newStage}`,
      {
        fontSize: '14px',
        color: '#ff4444',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5).setDepth(700);
    
    // Flash effect
    this.scene.cameras.main.flash(200, 100, 0, 0);
    
    this.scene.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 2000,
      ease: 'Power2',
      onComplete: () => text.destroy()
    });
  }
  
  /**
   * Set visibility
   */
  setVisible(visible: boolean): void {
    this.container.setVisible(visible);
  }
  
  /**
   * Destroy the panel
   */
  destroy(): void {
    if (this.pulseTween) {
      this.pulseTween.stop();
    }
    this.container.destroy();
  }
}

import Phaser from 'phaser';
import { LoreManager, FullLoreEntry, LoreCategory, LORE_DATABASE } from '../systems/LoreManager';
import { MetaProgressionManager } from '../systems/MetaProgressionManager';

/**
 * LoreUI - Displays lore entries and the player's journal/codex
 * 
 * Two modes:
 * 1. Reading a newly found lore entry (modal popup)
 * 2. Browsing the journal/codex (full screen)
 */
export class LoreUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private background: Phaser.GameObjects.Rectangle;
  private loreManager: LoreManager;
  private meta: MetaProgressionManager;
  
  // UI elements
  private titleText!: Phaser.GameObjects.Text;
  private contentText!: Phaser.GameObjects.Text;
  private categoryText!: Phaser.GameObjects.Text;
  private closeButton!: Phaser.GameObjects.Rectangle;
  private closeText!: Phaser.GameObjects.Text;
  private effectsText!: Phaser.GameObjects.Text;
  
  // Callback for effects
  private onEffectsCallback?: (insightGain: number, paleGain: number, curseEffect: number) => void;
  
  private isVisible = false;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.loreManager = LoreManager.getInstance();
    this.meta = MetaProgressionManager.getInstance();
    
    // Create container
    this.container = scene.add.container(0, 0);
    this.container.setDepth(2000); // Above everything
    this.container.setVisible(false);
    
    // Semi-transparent background
    this.background = scene.add.rectangle(
      scene.cameras.main.width / 2,
      scene.cameras.main.height / 2,
      scene.cameras.main.width,
      scene.cameras.main.height,
      0x000000,
      0.9
    );
    this.container.add(this.background);
    
    this.createUI();
  }
  
  private createUI(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Parchment-style background
    const parchment = this.scene.add.rectangle(
      width / 2,
      height / 2,
      700,
      500,
      0x2a1810,
      1
    );
    parchment.setStrokeStyle(3, 0x8b6914);
    this.container.add(parchment);
    
    // Inner parchment
    const inner = this.scene.add.rectangle(
      width / 2,
      height / 2,
      680,
      480,
      0x1a0e08,
      1
    );
    this.container.add(inner);
    
    // Category label
    this.categoryText = this.scene.add.text(
      width / 2,
      height / 2 - 210,
      '',
      {
        fontSize: '14px',
        color: '#8b6914',
        fontStyle: 'italic'
      }
    );
    this.categoryText.setOrigin(0.5);
    this.container.add(this.categoryText);
    
    // Title
    this.titleText = this.scene.add.text(
      width / 2,
      height / 2 - 180,
      '',
      {
        fontSize: '24px',
        color: '#c9a227',
        fontFamily: 'serif'
      }
    );
    this.titleText.setOrigin(0.5);
    this.container.add(this.titleText);
    
    // Content area with word wrap
    this.contentText = this.scene.add.text(
      width / 2 - 310,
      height / 2 - 140,
      '',
      {
        fontSize: '14px',
        color: '#a0a0a0',
        lineSpacing: 6,
        wordWrap: { width: 620 }
      }
    );
    this.container.add(this.contentText);
    
    // Effects text (insight gain, etc.)
    this.effectsText = this.scene.add.text(
      width / 2,
      height / 2 + 180,
      '',
      {
        fontSize: '12px',
        color: '#4a90d9',
        align: 'center'
      }
    );
    this.effectsText.setOrigin(0.5);
    this.container.add(this.effectsText);
    
    // Close button
    this.closeButton = this.scene.add.rectangle(
      width / 2,
      height / 2 + 220,
      150,
      40,
      0x3a2010
    );
    this.closeButton.setStrokeStyle(2, 0x8b6914);
    this.closeButton.setInteractive({ useHandCursor: true });
    this.closeButton.on('pointerover', () => {
      this.closeButton.setFillStyle(0x5a3020);
    });
    this.closeButton.on('pointerout', () => {
      this.closeButton.setFillStyle(0x3a2010);
    });
    this.closeButton.on('pointerdown', () => {
      this.hide();
    });
    this.container.add(this.closeButton);
    
    this.closeText = this.scene.add.text(
      width / 2,
      height / 2 + 220,
      'Close',
      {
        fontSize: '16px',
        color: '#c9a227'
      }
    );
    this.closeText.setOrigin(0.5);
    this.container.add(this.closeText);
  }
  
  /**
   * Show a lore entry when discovered
   */
  showLoreEntry(
    entry: FullLoreEntry, 
    isNewDiscovery: boolean = true,
    onEffects?: (insightGain: number, paleGain: number, curseEffect: number) => void
  ): void {
    this.onEffectsCallback = onEffects;
    
    // Set category
    this.categoryText.setText(this.getCategoryDisplayName(entry.category));
    this.categoryText.setColor(this.getCategoryColor(entry.category));
    
    // Set title
    this.titleText.setText(entry.title);
    
    // Set content - check if translated
    let content = entry.content;
    if (entry.requiresTranslation) {
      const fragments = this.meta.getTranslationProgress(entry.id);
      if (fragments < entry.translationFragmentsNeeded) {
        content = entry.partialContent || '[UNTRANSLATED]';
      }
    }
    this.contentText.setText(content);
    
    // Set effects text
    let effectsStr = '';
    if (isNewDiscovery) {
      effectsStr = '📜 New Discovery!\n';
      if (entry.insightGain > 0) {
        effectsStr += `+${entry.insightGain} Insight  `;
      }
      if (entry.paleAttentionGain > 0) {
        effectsStr += `⚠️ +${entry.paleAttentionGain} Pale Attention`;
      }
      if (entry.curseEffect) {
        effectsStr += `\n☠️ Curse accelerated`;
      }
    }
    this.effectsText.setText(effectsStr);
    
    // Apply effects via callback
    if (isNewDiscovery && onEffects) {
      onEffects(
        entry.insightGain, 
        entry.paleAttentionGain, 
        entry.curseEffect || 0
      );
    }
    
    // Add special visual effects for dangerous lore
    if (entry.category === LoreCategory.PALE_FRAGMENT) {
      this.addCorruptionEffect();
    }
    
    this.container.setVisible(true);
    this.isVisible = true;
    
    // Animate in
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 300,
      ease: 'Power2'
    });
  }
  
  /**
   * Show a random undiscovered lore entry the player can find
   */
  showRandomLore(currentInsight: number): boolean {
    const entry = this.loreManager.getRandomDiscoverableLore(currentInsight);
    if (!entry) return false;
    
    // Mark as discovered
    const effects = this.loreManager.discoverLore(entry.id, currentInsight);
    if (!effects) return false;
    
    this.showLoreEntry(entry, true, (insightGain, paleGain, curseEffect) => {
      // Effects are handled by caller
      console.log(`[LORE] Discovered: ${entry.title}`);
    });
    
    return true;
  }
  
  private getCategoryDisplayName(category: LoreCategory): string {
    switch (category) {
      case LoreCategory.SHIP_LOG: return '📋 Ship\'s Log';
      case LoreCategory.FATHERS_JOURNAL: return '📔 Father\'s Journal';
      case LoreCategory.ANCIENT_TEXT: return '📜 Ancient Text';
      case LoreCategory.MONASTERY_RECORD: return '⚖️ Monastery Record';
      case LoreCategory.ARMADA_DOCUMENT: return '⚓ Armada Document';
      case LoreCategory.DROWNED_WHISPER: return '🌊 Drowned Whisper';
      case LoreCategory.TAVERN_RUMOR: return '🍺 Tavern Rumor';
      case LoreCategory.PALE_FRAGMENT: return '⚠️ Forbidden Knowledge';
      default: return '📄 Document';
    }
  }
  
  private getCategoryColor(category: LoreCategory): string {
    switch (category) {
      case LoreCategory.FATHERS_JOURNAL: return '#c9a227';
      case LoreCategory.MONASTERY_RECORD: return '#9090ff';
      case LoreCategory.ARMADA_DOCUMENT: return '#ffd700';
      case LoreCategory.DROWNED_WHISPER: return '#20a0a0';
      case LoreCategory.PALE_FRAGMENT: return '#ffcc00';
      case LoreCategory.ANCIENT_TEXT: return '#a090d0';
      default: return '#808080';
    }
  }
  
  private addCorruptionEffect(): void {
    // Add visual corruption for Pale Fragment lore
    const corruption = this.scene.add.rectangle(
      this.scene.cameras.main.width / 2,
      this.scene.cameras.main.height / 2,
      700,
      500,
      0xffcc00,
      0.05
    );
    this.container.add(corruption);
    
    // Pulse effect
    this.scene.tweens.add({
      targets: corruption,
      alpha: 0.15,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  
  hide(): void {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.container.setVisible(false);
        this.isVisible = false;
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

/**
 * JournalUI - Full codex/journal browser
 */
export class JournalUI {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private loreManager: LoreManager;
  private meta: MetaProgressionManager;
  
  private categoryButtons: Map<LoreCategory, Phaser.GameObjects.Container> = new Map();
  private selectedCategory: LoreCategory = LoreCategory.FATHERS_JOURNAL;
  private entryList: Phaser.GameObjects.Container[] = [];
  private contentDisplay!: Phaser.GameObjects.Text;
  private selectedEntry: FullLoreEntry | null = null;
  
  private isVisible = false;
  
  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.loreManager = LoreManager.getInstance();
    this.meta = MetaProgressionManager.getInstance();
    
    this.container = scene.add.container(0, 0);
    this.container.setDepth(1900);
    this.container.setVisible(false);
    
    this.createUI();
  }
  
  private createUI(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Full screen background
    const bg = this.scene.add.rectangle(
      width / 2, height / 2,
      width, height,
      0x0a0808, 0.95
    );
    this.container.add(bg);
    
    // Journal frame
    const frame = this.scene.add.rectangle(
      width / 2, height / 2,
      width - 40, height - 40,
      0x1a0e08, 1
    );
    frame.setStrokeStyle(3, 0x8b6914);
    this.container.add(frame);
    
    // Title
    const title = this.scene.add.text(
      width / 2, 40,
      '📖 Captain\'s Journal',
      {
        fontSize: '28px',
        color: '#c9a227'
      }
    );
    title.setOrigin(0.5);
    this.container.add(title);
    
    // Category sidebar
    this.createCategorySidebar();
    
    // Entry list area
    this.createEntryList();
    
    // Content display area
    this.contentDisplay = this.scene.add.text(
      width / 2 + 100, 100,
      'Select an entry to read...',
      {
        fontSize: '14px',
        color: '#a0a0a0',
        lineSpacing: 6,
        wordWrap: { width: 400 }
      }
    );
    this.container.add(this.contentDisplay);
    
    // Close button
    const closeBtn = this.scene.add.rectangle(
      width - 60, 40,
      80, 35,
      0x3a2010
    );
    closeBtn.setStrokeStyle(2, 0x8b6914);
    closeBtn.setInteractive({ useHandCursor: true });
    closeBtn.on('pointerover', () => closeBtn.setFillStyle(0x5a3020));
    closeBtn.on('pointerout', () => closeBtn.setFillStyle(0x3a2010));
    closeBtn.on('pointerdown', () => this.hide());
    this.container.add(closeBtn);
    
    const closeText = this.scene.add.text(
      width - 60, 40,
      'Close',
      { fontSize: '14px', color: '#c9a227' }
    );
    closeText.setOrigin(0.5);
    this.container.add(closeText);
    
    // Progress display
    this.createProgressDisplay();
  }
  
  private createCategorySidebar(): void {
    const categories = [
      LoreCategory.FATHERS_JOURNAL,
      LoreCategory.MONASTERY_RECORD,
      LoreCategory.ANCIENT_TEXT,
      LoreCategory.ARMADA_DOCUMENT,
      LoreCategory.DROWNED_WHISPER,
      LoreCategory.TAVERN_RUMOR,
      LoreCategory.PALE_FRAGMENT
    ];
    
    let y = 100;
    for (const cat of categories) {
      const btn = this.createCategoryButton(cat, 100, y);
      this.categoryButtons.set(cat, btn);
      this.container.add(btn);
      y += 45;
    }
  }
  
  private createCategoryButton(category: LoreCategory, x: number, y: number): Phaser.GameObjects.Container {
    const btn = this.scene.add.container(x, y);
    
    const bg = this.scene.add.rectangle(0, 0, 150, 38, 0x2a1810);
    bg.setStrokeStyle(1, 0x5a4020);
    btn.add(bg);
    
    const name = this.getCategoryShortName(category);
    const text = this.scene.add.text(0, 0, name, {
      fontSize: '12px',
      color: '#a08050'
    });
    text.setOrigin(0.5);
    btn.add(text);
    
    // Count discovered
    const discovered = this.loreManager.getLoreByCategory(category)
      .filter(l => this.loreManager.hasDiscovered(l.id)).length;
    const total = this.loreManager.getLoreByCategory(category).length;
    
    const count = this.scene.add.text(60, 0, `${discovered}/${total}`, {
      fontSize: '10px',
      color: discovered > 0 ? '#60a060' : '#606060'
    });
    count.setOrigin(0.5);
    btn.add(count);
    
    // Interactivity
    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover', () => {
      bg.setFillStyle(0x3a2820);
    });
    bg.on('pointerout', () => {
      bg.setFillStyle(category === this.selectedCategory ? 0x4a3020 : 0x2a1810);
    });
    bg.on('pointerdown', () => {
      this.selectCategory(category);
    });
    
    return btn;
  }
  
  private getCategoryShortName(category: LoreCategory): string {
    switch (category) {
      case LoreCategory.FATHERS_JOURNAL: return "📔 Father's";
      case LoreCategory.MONASTERY_RECORD: return '⚖️ Monastery';
      case LoreCategory.ANCIENT_TEXT: return '📜 Ancient';
      case LoreCategory.ARMADA_DOCUMENT: return '⚓ Armada';
      case LoreCategory.DROWNED_WHISPER: return '🌊 Drowned';
      case LoreCategory.TAVERN_RUMOR: return '🍺 Rumors';
      case LoreCategory.PALE_FRAGMENT: return '⚠️ Forbidden';
      default: return '📄 Other';
    }
  }
  
  private createEntryList(): void {
    // Entry list panel
    const listBg = this.scene.add.rectangle(
      280, this.scene.cameras.main.height / 2,
      180, this.scene.cameras.main.height - 160,
      0x1a1010
    );
    listBg.setStrokeStyle(1, 0x3a2020);
    this.container.add(listBg);
  }
  
  private selectCategory(category: LoreCategory): void {
    this.selectedCategory = category;
    this.refreshEntryList();
    
    // Update button styles
    this.categoryButtons.forEach((btn, cat) => {
      const bg = btn.first as Phaser.GameObjects.Rectangle;
      bg.setFillStyle(cat === category ? 0x4a3020 : 0x2a1810);
    });
  }
  
  private refreshEntryList(): void {
    // Clear existing entries
    for (const entry of this.entryList) {
      entry.destroy();
    }
    this.entryList = [];
    
    const entries = this.loreManager.getLoreByCategory(this.selectedCategory);
    const discovered = entries.filter(e => this.loreManager.hasDiscovered(e.id));
    const undiscovered = entries.filter(e => !this.loreManager.hasDiscovered(e.id));
    
    let y = 110;
    
    // Show discovered entries
    for (const entry of discovered) {
      const item = this.createEntryItem(entry, 280, y, true);
      this.container.add(item);
      this.entryList.push(item);
      y += 35;
    }
    
    // Show undiscovered placeholders
    for (const entry of undiscovered) {
      const item = this.createEntryItem(entry, 280, y, false);
      this.container.add(item);
      this.entryList.push(item);
      y += 35;
    }
  }
  
  private createEntryItem(
    entry: FullLoreEntry, 
    x: number, 
    y: number, 
    isDiscovered: boolean
  ): Phaser.GameObjects.Container {
    const item = this.scene.add.container(x, y);
    
    const bg = this.scene.add.rectangle(0, 0, 165, 30, 0x201515);
    item.add(bg);
    
    if (isDiscovered) {
      const title = entry.title.length > 18 
        ? entry.title.substring(0, 16) + '...' 
        : entry.title;
      
      const text = this.scene.add.text(-75, 0, title, {
        fontSize: '11px',
        color: '#b0a080'
      });
      text.setOrigin(0, 0.5);
      item.add(text);
      
      // Make clickable
      bg.setInteractive({ useHandCursor: true });
      bg.on('pointerover', () => bg.setFillStyle(0x302520));
      bg.on('pointerout', () => bg.setFillStyle(0x201515));
      bg.on('pointerdown', () => this.showEntry(entry));
    } else {
      const text = this.scene.add.text(-75, 0, '???', {
        fontSize: '11px',
        color: '#404040',
        fontStyle: 'italic'
      });
      text.setOrigin(0, 0.5);
      item.add(text);
      
      // Show hint on hover
      if (entry.locationHint) {
        bg.setInteractive();
        bg.on('pointerover', () => {
          this.contentDisplay.setText(`[Undiscovered]\n\nHint: ${entry.locationHint}\n\nInsight Required: ${entry.insightRequired}`);
        });
      }
    }
    
    return item;
  }
  
  private showEntry(entry: FullLoreEntry): void {
    this.selectedEntry = entry;
    
    let content = entry.content;
    
    // Check translation status
    if (entry.requiresTranslation) {
      const fragments = this.meta.getTranslationProgress(entry.id);
      if (fragments < entry.translationFragmentsNeeded) {
        content = entry.partialContent || '[UNTRANSLATED]';
        content += `\n\n[Translation Progress: ${fragments}/${entry.translationFragmentsNeeded}]`;
      }
    }
    
    this.contentDisplay.setText(content);
    this.contentDisplay.setColor(this.getContentColor(entry));
  }
  
  private getContentColor(entry: FullLoreEntry): string {
    switch (entry.category) {
      case LoreCategory.PALE_FRAGMENT: return '#d0b050';
      case LoreCategory.DROWNED_WHISPER: return '#60a0a0';
      case LoreCategory.FATHERS_JOURNAL: return '#c0b080';
      default: return '#a0a0a0';
    }
  }
  
  private createProgressDisplay(): void {
    const width = this.scene.cameras.main.width;
    const height = this.scene.cameras.main.height;
    
    // Father's Journal progress
    const progress = this.loreManager.getFatherJournalProgress();
    
    const progressText = this.scene.add.text(
      width - 200, height - 60,
      `Father's Trail: ${progress.found}/${progress.total}`,
      {
        fontSize: '14px',
        color: progress.found > 0 ? '#c9a227' : '#606060'
      }
    );
    this.container.add(progressText);
    
    // Total lore discovered
    const totalDiscovered = this.meta.getDiscoveredLoreCount();
    const totalLore = LORE_DATABASE.length;
    
    const totalText = this.scene.add.text(
      width - 200, height - 40,
      `Total Discovered: ${totalDiscovered}/${totalLore}`,
      {
        fontSize: '12px',
        color: '#808080'
      }
    );
    this.container.add(totalText);
  }
  
  show(): void {
    this.selectCategory(LoreCategory.FATHERS_JOURNAL);
    this.container.setVisible(true);
    this.isVisible = true;
    
    this.container.setAlpha(0);
    this.scene.tweens.add({
      targets: this.container,
      alpha: 1,
      duration: 300
    });
  }
  
  hide(): void {
    this.scene.tweens.add({
      targets: this.container,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        this.container.setVisible(false);
        this.isVisible = false;
      }
    });
  }
  
  toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }
  
  isShowing(): boolean {
    return this.isVisible;
  }
  
  destroy(): void {
    this.container.destroy();
  }
}

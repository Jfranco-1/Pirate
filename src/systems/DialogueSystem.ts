import { InsightThreshold, PirateClass } from '../types';
import { MetaProgressionManager } from './MetaProgressionManager';
import { LoreManager } from './LoreManager';

/**
 * DialogueSystem - Manages NPC dialogue and story delivery
 * 
 * Dialogue changes based on:
 * - Player's insight level (higher insight = more truth revealed)
 * - Discovered lore (NPCs reference what player knows)
 * - Pale Attention (high attention = cryptic warnings, interference)
 * - Current curse stage (desperation, different attitudes)
 * - Player class (different dialogue for Chaplain vs Duelist)
 * - Run number (NPCs remember across runs, sort of)
 */

// NPC archetypes
export enum NPCType {
  TAVERN_KEEPER = 'tavern_keeper',
  MONASTERY_MONK = 'monastery_monk',
  ARMADA_OFFICER = 'armada_officer',
  MERCHANT = 'merchant',
  DROWNED_ENVOY = 'drowned_envoy',
  MYSTERIOUS_STRANGER = 'mysterious_stranger',  // Pale Messenger's thrall
  FATHER_SHADE = 'father_shade',  // Late game
  CREW_MEMBER = 'crew_member'
}

// Dialogue node structure
export interface DialogueNode {
  id: string;
  npcType: NPCType;
  text: string;
  
  // Conditions for showing this dialogue
  conditions?: {
    minInsight?: number;
    maxInsight?: number;
    requiresLore?: string[];
    forbidsLore?: string[];
    minPaleAttention?: number;
    maxPaleAttention?: number;
    curseStage?: number;
    playerClass?: PirateClass;
    runNumber?: number;  // Minimum runs completed
  };
  
  // Response options
  responses?: DialogueResponse[];
  
  // Effects of seeing this dialogue
  effects?: {
    insightGain?: number;
    paleAttentionGain?: number;
    revealsLore?: string;  // Lore ID to mark discovered
    setFlag?: string;  // Game state flag
  };
  
  // Visual/audio cues
  mood?: 'neutral' | 'warning' | 'friendly' | 'hostile' | 'cryptic' | 'corrupted';
}

export interface DialogueResponse {
  text: string;
  nextNodeId?: string;  // Chain to another dialogue
  effects?: {
    insightGain?: number;
    paleAttentionGain?: number;
    currencyGain?: number;
    currencyCost?: number;
  };
  conditions?: {
    minInsight?: number;
    minCurrency?: number;
  };
}

// The dialogue database
export const DIALOGUE_DATABASE: DialogueNode[] = [
  // ================================================
  // TAVERN KEEPER - Common knowledge, rumors
  // ================================================
  {
    id: 'tavern_greeting_base',
    npcType: NPCType.TAVERN_KEEPER,
    text: "Welcome, traveler. The sea's been rough lately. Something's stirring in the deep.",
    mood: 'neutral',
    responses: [
      { text: "What's stirring?", nextNodeId: 'tavern_rumor_drowned' },
      { text: "I'm looking for my father.", nextNodeId: 'tavern_father_question' },
      { text: "Just passing through." }
    ]
  },
  {
    id: 'tavern_rumor_drowned',
    npcType: NPCType.TAVERN_KEEPER,
    text: "The Drowned, they call 'em. Used to be people, now... something else. They say there's a god beneath the waves that changes folk. Makes 'em serve.",
    mood: 'neutral',
    effects: { insightGain: 1 }
  },
  {
    id: 'tavern_father_question',
    npcType: NPCType.TAVERN_KEEPER,
    text: "Your father? Lots of folk come through here. What's he look like?",
    responses: [
      { text: "He was hunting statue pieces.", nextNodeId: 'tavern_statue_response' },
      { text: "Never mind." }
    ]
  },
  {
    id: 'tavern_statue_response',
    npcType: NPCType.TAVERN_KEEPER,
    text: "...Statue pieces, you say? [The tavern keeper's voice drops] Careful, friend. Those who seek such things... they find trouble. Or trouble finds them.",
    mood: 'warning',
    effects: { insightGain: 2 }
  },
  
  // High insight - tavern keeper reveals more
  {
    id: 'tavern_greeting_highinsight',
    npcType: NPCType.TAVERN_KEEPER,
    text: "[The keeper studies you with knowing eyes] You've seen things. I can tell. The world looks different once you start SEEING, doesn't it?",
    conditions: { minInsight: 40 },
    mood: 'cryptic',
    responses: [
      { text: "What do you know about the golden light?", nextNodeId: 'tavern_golden_light' },
      { text: "Who else has been asking questions?" }
    ]
  },
  {
    id: 'tavern_golden_light',
    npcType: NPCType.TAVERN_KEEPER,
    text: "[Voice barely a whisper] Don't say that too loud. Some of my patrons... they'd take offense. Notice the Armada officer in the corner? His eyes. Watch his eyes.",
    conditions: { minInsight: 40 },
    mood: 'warning',
    effects: { insightGain: 5, paleAttentionGain: 3 }
  },

  // ================================================
  // MONASTERY MONK - Truth seekers
  // ================================================
  {
    id: 'monk_greeting_base',
    npcType: NPCType.MONASTERY_MONK,
    text: "The Monastery welcomes seekers. But not all who seek are ready for what they find.",
    mood: 'neutral',
    responses: [
      { text: "I seek the truth about the statue.", nextNodeId: 'monk_statue_lowinsight' },
      { text: "Tell me about the Drowned.", nextNodeId: 'monk_drowned_info' },
      { text: "I'll browse your archives." }
    ]
  },
  {
    id: 'monk_statue_lowinsight',
    npcType: NPCType.MONASTERY_MONK,
    text: "The statue's truth requires... preparation. Return when your sight has cleared. [The monk's face is unreadable]",
    conditions: { maxInsight: 49 },
    mood: 'cryptic',
    effects: { insightGain: 3 }
  },
  {
    id: 'monk_drowned_info',
    npcType: NPCType.MONASTERY_MONK,
    text: "The Drowned serve the Sovereign below. Most see them as enemies. We see them as... complicated. The enemy of my enemy, as they say.",
    mood: 'neutral',
    effects: { insightGain: 3 }
  },
  
  // High insight - monks speak more freely
  {
    id: 'monk_greeting_highinsight',
    npcType: NPCType.MONASTERY_MONK,
    text: "Ah. You can see, can't you? Truly see? Good. We can speak more plainly. [The monk relaxes slightly] What would you know?",
    conditions: { minInsight: 50 },
    mood: 'friendly',
    responses: [
      { text: "Tell me about the third path.", nextNodeId: 'monk_third_path' },
      { text: "Who is the true enemy?", nextNodeId: 'monk_true_enemy' },
      { text: "What happened to my father?", nextNodeId: 'monk_father_truth' }
    ]
  },
  {
    id: 'monk_third_path',
    npcType: NPCType.MONASTERY_MONK,
    text: "The Severance. To neither serve the Drowned Sovereign nor... the other. To cut the strings entirely. It requires all the statue pieces AND the binding words. Your father knew this. He tried.",
    conditions: { minInsight: 50 },
    mood: 'cryptic',
    effects: { insightGain: 10, revealsLore: 'monastery_warning' }
  },
  {
    id: 'monk_true_enemy',
    npcType: NPCType.MONASTERY_MONK,
    text: "[The monk glances around] The one we cannot name. It works through others—through the Armada especially. It wants the statue assembled. NOT for freedom, but for... [The monk's voice cuts off] We cannot speak more plainly. It might be listening even now.",
    conditions: { minInsight: 50 },
    mood: 'warning',
    effects: { insightGain: 8, paleAttentionGain: 5 }
  },
  {
    id: 'monk_father_truth',
    npcType: NPCType.MONASTERY_MONK,
    text: "Your father... understood. He took the curse willingly, became the Drowned Sovereign's champion. But within that role, he works against the greater threat. He guards what should not be freed. He is... a prisoner who became a jailer.",
    conditions: { minInsight: 50, requiresLore: ['father_journal_2'] },
    mood: 'cryptic',
    effects: { insightGain: 12 }
  },

  // ================================================
  // ARMADA OFFICER - Propaganda, hidden control
  // ================================================
  {
    id: 'armada_greeting_base',
    npcType: NPCType.ARMADA_OFFICER,
    text: "Civilian. The Gilded Armada maintains order on these seas. You'd do well to support our cause. Destiny favors the united.",
    mood: 'neutral',
    responses: [
      { text: "What is the Armada's mission?", nextNodeId: 'armada_mission' },
      { text: "I'm hunting the Drowned.", nextNodeId: 'armada_drowned_response' },
      { text: "[Leave]" }
    ]
  },
  {
    id: 'armada_mission',
    npcType: NPCType.ARMADA_OFFICER,
    text: "Order. Purpose. Unity. The seas have been chaos for too long. Under Admiral Vael's guidance, we bring clarity to confusion. A golden future awaits.",
    mood: 'neutral',
    effects: { paleAttentionGain: 2 }
  },
  {
    id: 'armada_drowned_response',
    npcType: NPCType.ARMADA_OFFICER,
    text: "Excellent! The Drowned threaten everything we've built. We seek the statue pieces to destroy the Sovereign once and for all. If you find any pieces, bring them to us. You'll be rewarded.",
    mood: 'friendly',
    effects: { insightGain: 1 }  // Small insight for recognizing the lie
  },
  
  // High insight - player sees through the facade
  {
    id: 'armada_greeting_highinsight',
    npcType: NPCType.ARMADA_OFFICER,
    text: "[The officer's smile doesn't reach his eyes. There's something... mechanical in his movements. His pupils seem to catch golden light that isn't there.] You look troubled, friend. Perhaps you need... guidance?",
    conditions: { minInsight: 40 },
    mood: 'corrupted',
    responses: [
      { text: "Your eyes... what's wrong with your eyes?", nextNodeId: 'armada_eyes_confrontation' },
      { text: "I don't need your guidance.", nextNodeId: 'armada_rejection' },
      { text: "[Pretend not to notice]", nextNodeId: 'armada_pretend' }
    ]
  },
  {
    id: 'armada_eyes_confrontation',
    npcType: NPCType.ARMADA_OFFICER,
    text: "[The officer's face goes blank for a moment, then the smile returns, wider] Nothing is wrong. Everything is as it should be. As it will be. [His hand moves toward his sword] You've been spending time with the wrong people.",
    conditions: { minInsight: 40 },
    mood: 'hostile',
    effects: { insightGain: 8, paleAttentionGain: 10 }
  },
  {
    id: 'armada_rejection',
    npcType: NPCType.ARMADA_OFFICER,
    text: "[The officer's smile doesn't flicker] Of course. But remember—we're always here. Waiting. When you're ready to join us, the path will be clear.",
    mood: 'cryptic',
    effects: { paleAttentionGain: 3 }
  },
  {
    id: 'armada_pretend',
    npcType: NPCType.ARMADA_OFFICER,
    text: "[The officer nods, satisfied] Wise. Very wise. Keep your head down, do your part, and the future will be bright. Golden, even.",
    mood: 'corrupted',
    effects: { insightGain: 2 }  // Smart to play along
  },

  // ================================================
  // MYSTERIOUS STRANGER - Pale Messenger's thrall
  // ================================================
  {
    id: 'stranger_greeting',
    npcType: NPCType.MYSTERIOUS_STRANGER,
    text: "[A figure in a hooded cloak. You can't quite make out their face. When they speak, their voice seems to come from everywhere at once.] Seeker. You've come far. But have you asked yourself... why?",
    conditions: { minPaleAttention: 20 },
    mood: 'cryptic',
    responses: [
      { text: "Who are you?", nextNodeId: 'stranger_identity' },
      { text: "I seek to break my curse.", nextNodeId: 'stranger_curse' },
      { text: "[Back away slowly]" }
    ],
    effects: { paleAttentionGain: 5 }
  },
  {
    id: 'stranger_identity',
    npcType: NPCType.MYSTERIOUS_STRANGER,
    text: "[Soft laughter] Names are such fragile things. I am... an interested party. Your journey has caught attention. Powerful attention. [Golden light seems to flicker at the edges of your vision]",
    mood: 'corrupted',
    effects: { insightGain: 5, paleAttentionGain: 10 }
  },
  {
    id: 'stranger_curse',
    npcType: NPCType.MYSTERIOUS_STRANGER,
    text: "The curse? A gift, really. It shows you things. Opens doors. Why would you want to be blind again? [The stranger leans closer] Assemble the statue. Free what lies beneath. Everything you want can be yours.",
    mood: 'corrupted',
    effects: { insightGain: 8, paleAttentionGain: 15 }
  },
  
  // High insight - seeing through the stranger
  {
    id: 'stranger_highinsight',
    npcType: NPCType.MYSTERIOUS_STRANGER,
    text: "[You see it now—the stranger's form flickers. Underneath the hood, there is no face. Just... golden light.] Ah. You SEE. How... inconvenient. [The voice hardens] But sight doesn't mean safety, little seeker.",
    conditions: { minInsight: 60 },
    mood: 'hostile',
    effects: { insightGain: 15, paleAttentionGain: 20 }
  },

  // ================================================
  // DROWNED ENVOY - Surprising allies
  // ================================================
  {
    id: 'drowned_greeting',
    npcType: NPCType.DROWNED_ENVOY,
    text: "[A figure emerges from the shallows—once human, now changed. Scales glint on their skin, but their eyes are tired, sad.] Surface-walker. We don't wish conflict. We wish... to warn.",
    mood: 'neutral',
    responses: [
      { text: "Warn me of what?", nextNodeId: 'drowned_warning' },
      { text: "Why should I trust you?", nextNodeId: 'drowned_trust' },
      { text: "[Attack]" }
    ]
  },
  {
    id: 'drowned_warning',
    npcType: NPCType.DROWNED_ENVOY,
    text: "The statue. Others seek it. They call themselves righteous—the Armada, the seekers of 'golden destiny.' They lie. The statue is a SEAL, not a treasure. Breaking it would... [The envoy shudders] There are worse things than drowning.",
    mood: 'warning',
    effects: { insightGain: 8 }
  },
  {
    id: 'drowned_trust',
    npcType: NPCType.DROWNED_ENVOY,
    text: "Trust? No. We don't ask for trust. We ask only that you THINK. Ask yourself—who benefits if the statue is assembled? Not us. Not you. We guard the prison. We always have. Even when it cost us... everything.",
    mood: 'cryptic',
    effects: { insightGain: 6 }
  },
  
  // High insight - full truth
  {
    id: 'drowned_highinsight',
    npcType: NPCType.DROWNED_ENVOY,
    text: "Your sight is clear. Good. Then hear this: The Sovereign volunteered for imprisonment. It CHOSE to become the jailer. The one it contains... cannot be named, cannot be directly opposed. Only contained. Your father understood. Do you?",
    conditions: { minInsight: 50 },
    mood: 'friendly',
    effects: { insightGain: 15, revealsLore: 'drowned_warning' }
  },

  // ================================================
  // FATHER'S SHADE - Late game encounters
  // ================================================
  {
    id: 'father_apparition',
    npcType: NPCType.FATHER_SHADE,
    text: "[A ghostly figure appears—your father's face, twisted by the curse but still recognizable.] Child... you shouldn't be here. But I knew you would come. I always knew.",
    conditions: { minInsight: 60, requiresLore: ['father_journal_3'] },
    mood: 'cryptic',
    responses: [
      { text: "Father... what happened to you?", nextNodeId: 'father_explanation' },
      { text: "How do I break the curse?", nextNodeId: 'father_curse_advice' },
      { text: "I found your journals.", nextNodeId: 'father_journals_response' }
    ],
    effects: { insightGain: 10 }
  },
  {
    id: 'father_explanation',
    npcType: NPCType.FATHER_SHADE,
    text: "[His form wavers] I made a choice. The curse would claim me either way—but I chose to serve the Drowned rather than... the other. In serving, I could protect. In guarding, I could resist. It's... not the life I wanted.",
    mood: 'cryptic',
    effects: { insightGain: 8 }
  },
  {
    id: 'father_curse_advice',
    npcType: NPCType.FATHER_SHADE,
    text: "[Urgently] The Severance. It's the only way. Collect the pieces, but don't assemble them for the Armada. Find the binding words in the Monastery archives. And when the time comes... [His voice breaks] You must be willing to make the same choice I made. Or find a third way.",
    mood: 'warning',
    effects: { insightGain: 12 }
  },
  {
    id: 'father_journals_response',
    npcType: NPCType.FATHER_SHADE,
    text: "[A sad smile] Then you know. You know what I became and why. I'm sorry I couldn't tell you directly. The golden light watches. It listens. Even now... [He glances upward] ...we're being observed. Be careful, child. Question everything. Even me.",
    conditions: { requiresLore: ['father_journal_3'] },
    mood: 'warning',
    effects: { insightGain: 10, paleAttentionGain: 8 }
  }
];

/**
 * DialogueSystem class for managing dialogue
 */
export class DialogueSystem {
  private meta: MetaProgressionManager;
  private loreManager: LoreManager;
  private currentInsight: number = 0;
  private currentPaleAttention: number = 0;
  private currentCurseStage: number = 1;
  private playerClass: PirateClass = PirateClass.DUELIST;
  
  constructor() {
    this.meta = MetaProgressionManager.getInstance();
    this.loreManager = LoreManager.getInstance();
  }
  
  /**
   * Update context for dialogue selection
   */
  setContext(
    insight: number, 
    paleAttention: number, 
    curseStage: number,
    playerClass: PirateClass
  ): void {
    this.currentInsight = insight;
    this.currentPaleAttention = paleAttention;
    this.currentCurseStage = curseStage;
    this.playerClass = playerClass;
  }
  
  /**
   * Get available dialogue for an NPC type
   */
  getAvailableDialogue(npcType: NPCType): DialogueNode[] {
    return DIALOGUE_DATABASE.filter(node => {
      if (node.npcType !== npcType) return false;
      return this.meetsConditions(node.conditions);
    });
  }
  
  /**
   * Get the best dialogue for an NPC (highest insight requirement met)
   */
  getBestDialogue(npcType: NPCType): DialogueNode | null {
    const available = this.getAvailableDialogue(npcType);
    if (available.length === 0) return null;
    
    // Sort by insight requirement (highest first)
    available.sort((a, b) => {
      const aInsight = a.conditions?.minInsight || 0;
      const bInsight = b.conditions?.minInsight || 0;
      return bInsight - aInsight;
    });
    
    return available[0];
  }
  
  /**
   * Get a specific dialogue node by ID
   */
  getDialogueNode(nodeId: string): DialogueNode | undefined {
    return DIALOGUE_DATABASE.find(n => n.id === nodeId);
  }
  
  /**
   * Check if conditions are met for a dialogue node
   */
  private meetsConditions(conditions?: DialogueNode['conditions']): boolean {
    if (!conditions) return true;
    
    // Insight checks
    if (conditions.minInsight !== undefined && this.currentInsight < conditions.minInsight) {
      return false;
    }
    if (conditions.maxInsight !== undefined && this.currentInsight > conditions.maxInsight) {
      return false;
    }
    
    // Pale Attention checks
    if (conditions.minPaleAttention !== undefined && this.currentPaleAttention < conditions.minPaleAttention) {
      return false;
    }
    if (conditions.maxPaleAttention !== undefined && this.currentPaleAttention > conditions.maxPaleAttention) {
      return false;
    }
    
    // Curse stage
    if (conditions.curseStage !== undefined && this.currentCurseStage < conditions.curseStage) {
      return false;
    }
    
    // Player class
    if (conditions.playerClass !== undefined && this.playerClass !== conditions.playerClass) {
      return false;
    }
    
    // Required lore
    if (conditions.requiresLore) {
      for (const loreId of conditions.requiresLore) {
        if (!this.loreManager.hasDiscovered(loreId)) {
          return false;
        }
      }
    }
    
    // Forbidden lore (dialogue only available if player HASN'T discovered this)
    if (conditions.forbidsLore) {
      for (const loreId of conditions.forbidsLore) {
        if (this.loreManager.hasDiscovered(loreId)) {
          return false;
        }
      }
    }
    
    // Run number
    if (conditions.runNumber !== undefined) {
      const runs = this.meta.save.totalRuns || 0;
      if (runs < conditions.runNumber) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Get filtered responses for a dialogue node
   */
  getAvailableResponses(node: DialogueNode): DialogueResponse[] {
    if (!node.responses) return [];
    
    return node.responses.filter(response => {
      if (!response.conditions) return true;
      
      if (response.conditions.minInsight !== undefined && 
          this.currentInsight < response.conditions.minInsight) {
        return false;
      }
      
      if (response.conditions.minCurrency !== undefined &&
          this.meta.save.currency < response.conditions.minCurrency) {
        return false;
      }
      
      return true;
    });
  }
  
  /**
   * Get mood-based text color for dialogue
   */
  getMoodColor(mood?: DialogueNode['mood']): string {
    switch (mood) {
      case 'warning': return '#ffaa00';
      case 'hostile': return '#ff4444';
      case 'friendly': return '#44ff44';
      case 'cryptic': return '#aa88ff';
      case 'corrupted': return '#ffcc00';
      default: return '#ffffff';
    }
  }
}

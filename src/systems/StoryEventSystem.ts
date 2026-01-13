import { PirateClass, InsightThreshold } from '../types';
import { LoreManager, LoreCategory } from './LoreManager';
import { MetaProgressionManager } from './MetaProgressionManager';

/**
 * StoryEventSystem - Random narrative events during gameplay
 * 
 * These events deliver story through:
 * - Environmental discoveries (corpses with journals, hidden rooms)
 * - Random encounters (NPCs, mysterious phenomena)
 * - Choice-driven moments (moral decisions, bargains)
 * - Pale Messenger interference (higher attention = more events)
 */

export enum EventType {
  DISCOVERY = 'discovery',      // Find something
  ENCOUNTER = 'encounter',      // Meet someone
  CHOICE = 'choice',            // Make a decision
  OMEN = 'omen',               // Cryptic warning/sign
  INTERFERENCE = 'interference', // Pale Messenger meddling
  MEMORY = 'memory'            // Flashback/vision
}

export interface StoryEventOption {
  text: string;
  effects: {
    insightGain?: number;
    paleAttentionGain?: number;
    currencyGain?: number;
    currencyCost?: number;
    healthCost?: number;
    healthGain?: number;
    curseAdvance?: number;
    revealLore?: string;
  };
  resultText: string;
}

export interface StoryEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  
  // Conditions for triggering
  conditions?: {
    minInsight?: number;
    maxInsight?: number;
    minPaleAttention?: number;
    maxPaleAttention?: number;
    minCurseStage?: number;
    requiresLore?: string[];
    forbidsLore?: string[];
    playerClass?: PirateClass;
    minRuns?: number;
    dungeonLevel?: number;
  };
  
  // What happens
  options: StoryEventOption[];
  
  // Visual theming
  mood: 'neutral' | 'warning' | 'mysterious' | 'horror' | 'hope';
  
  // One-time or repeatable
  unique: boolean;
}

export const STORY_EVENTS: StoryEvent[] = [
  // ============================================
  // EARLY GAME DISCOVERIES
  // ============================================
  {
    id: 'drowned_corpse_journal',
    type: EventType.DISCOVERY,
    title: 'Waterlogged Corpse',
    description: `You find a body slumped against the wall, long dead. Barnacles encrust the armor, and seawater pools beneath. Clutched in its skeletal hand is a waterlogged journal.

The pages are mostly ruined, but some text remains legible...`,
    options: [
      {
        text: 'Read the journal',
        effects: { insightGain: 3, revealLore: 'rumor_drowned' },
        resultText: 'The journal belonged to a sailor who encountered the Drowned. His final entries speak of "impossible beauty beneath the waves" and warnings about "those who serve the golden light."'
      },
      {
        text: 'Search the body instead',
        effects: { currencyGain: 15 },
        resultText: 'You find a small pouch of doubloons hidden in a boot. Whatever killed this sailor wasn\'t interested in gold.'
      },
      {
        text: 'Leave it undisturbed',
        effects: {},
        resultText: 'Some things are better left alone. You continue on your way.'
      }
    ],
    mood: 'neutral',
    unique: true
  },
  
  {
    id: 'golden_graffiti',
    type: EventType.OMEN,
    title: 'Strange Markings',
    description: `On the wall, someone has painted a symbol in faded gold paint. It's a pattern you've never seen before—concentric circles with a single eye at the center.

Looking at it makes your head ache slightly.

Written beneath in hasty script: "THEY ARE WATCHING. THEY ARE ALWAYS WATCHING."`,
    conditions: { minPaleAttention: 10 },
    options: [
      {
        text: 'Study the symbol closely',
        effects: { insightGain: 5, paleAttentionGain: 8 },
        resultText: 'As you stare, you feel... observed. The symbol seems to shift, the eye following your movement. You blink, and it\'s just paint again. But the feeling lingers.'
      },
      {
        text: 'Destroy the symbol',
        effects: { paleAttentionGain: 3 },
        resultText: 'You scrape the paint from the wall. It feels like the right thing to do. But you can\'t shake the sensation that something noticed.'
      },
      {
        text: 'Ignore it',
        effects: { insightGain: 1 },
        resultText: 'You walk past. Sometimes ignorance is its own protection.'
      }
    ],
    mood: 'mysterious',
    unique: false
  },
  
  // ============================================
  // MID GAME ENCOUNTERS
  // ============================================
  {
    id: 'armada_deserter',
    type: EventType.ENCOUNTER,
    title: 'Deserter in the Shadows',
    description: `A figure emerges from behind a pillar—an Armada soldier, but something's wrong. His uniform is torn, his eyes bloodshot and desperate.

"Please," he whispers. "Please, you have to help me. I can't go back. They're... they're not right. The officers. Their eyes. The things they make us do. It's all wrong."

He grips your arm with trembling hands. "They talk about 'golden destiny' and 'the coming light.' I started seeing things. FEELING things. Like something was inside my head, making me want to obey."`,
    conditions: { minInsight: 20 },
    options: [
      {
        text: 'Help him hide',
        effects: { insightGain: 8, currencyCost: 10 },
        resultText: 'You give him directions to a safe port and some coin for the journey. As he leaves, he presses something into your hand—a golden badge with the eye symbol. "Evidence," he says. "They\'re not human anymore. Not really."'
      },
      {
        text: 'Ask what he knows about the Armada',
        effects: { insightGain: 12, paleAttentionGain: 5 },
        resultText: 'He speaks quickly, terrified: "Admiral Vael isn\'t... she\'s not in control. There\'s something ELSE. I saw her office once—maps with symbols I didn\'t recognize, plans that made no sense unless... unless you wanted something RELEASED." He flees before he can say more.'
      },
      {
        text: 'Turn him in (he might be lying)',
        effects: { currencyGain: 30, paleAttentionGain: 2 },
        resultText: 'You report his location to an Armada patrol. They thank you with gold and a smile that doesn\'t reach their eyes. "The golden path rewards loyalty," they say. You feel a chill.'
      }
    ],
    mood: 'warning',
    unique: true
  },
  
  {
    id: 'monastery_refugee',
    type: EventType.ENCOUNTER,
    title: 'Fleeing Monk',
    description: `A monk in travel-worn robes approaches you cautiously. Her eyes are sharp, calculating.

"You're the one seeking the statue pieces," she says. It's not a question. "The Monastery sent me. We can't speak openly—too many ears in port towns—but I carry a message."

She hands you a sealed letter. "Read it when you're alone. And... be careful what you learn. Knowledge has weight. Some truths are heavy enough to drown in."`,
    conditions: { minInsight: 35, requiresLore: ['monastery_history_1'] },
    options: [
      {
        text: 'Ask her about the third path',
        effects: { insightGain: 10, paleAttentionGain: 3 },
        resultText: 'She glances around nervously. "The Severance. It exists. But the cost..." She shakes her head. "You must find all the pieces AND the binding words. The words are hidden in our archives—but you\'ll need high insight to read them. The translation is... protected." She vanishes into the crowd before you can ask more.'
      },
      {
        text: 'Ask about your father',
        effects: { insightGain: 8, revealLore: 'monastery_warning' },
        resultText: '"Your father... understood what few do. He chose corruption over CORRUPTION, if you understand me. The lesser evil. He guards the prison now, but within that role, he fights." Her voice drops. "Don\'t hate him. He did what he had to do. What you may have to do."'
      },
      {
        text: 'Read the letter immediately',
        effects: { insightGain: 15, paleAttentionGain: 8 },
        resultText: 'The letter contains a partial map of the Monastery archives and a warning: "The eye symbol you\'ve seen marks their influence. The Armada serves something older than gold. The Drowned are guardians, not monsters. Your father is both prisoner and jailer. Trust your sight. Question golden words."'
      }
    ],
    mood: 'mysterious',
    unique: true
  },
  
  // ============================================
  // HIGH INSIGHT EVENTS
  // ============================================
  {
    id: 'pale_whisper',
    type: EventType.INTERFERENCE,
    title: 'A Voice in the Silence',
    description: `You hear it—a voice, but not through your ears. It resonates somewhere deeper, in a place you didn't know existed.

"YOU SEEK TOO MUCH, LITTLE SEEKER."

The world seems to dim. Colors drain. And then, for just a moment, you SEE—golden threads connecting people like puppets, all leading upward to a light that hurts to perceive.

"STOP LOOKING. JOIN US. IT'S EASIER. IT'S WARMER. DON'T YOU WANT TO BELONG?"`,
    conditions: { minPaleAttention: 40, minInsight: 50 },
    options: [
      {
        text: 'Reject the voice',
        effects: { insightGain: 15, paleAttentionGain: 20, healthCost: 5 },
        resultText: 'You scream your defiance, and the vision shatters. Pain lances through your skull. But you\'re still yourself. The voice fades, but its last words echo: "WE HAVE TIME. WE ALWAYS HAVE TIME."'
      },
      {
        text: 'Listen to what it offers',
        effects: { paleAttentionGain: 30, healthGain: 10, currencyGain: 50 },
        resultText: 'For a moment, you let it in. Warmth floods through you—purpose, belonging, certainty. The world makes sense. When the vision fades, you find gold in your pocket that wasn\'t there before. And a certainty that terrifies you: it felt GOOD.'
      },
      {
        text: 'Ask it about the Severance',
        effects: { insightGain: 25, paleAttentionGain: 35, healthCost: 10 },
        resultText: 'The voice SCREAMS—a sound of fury and fear. "THE SEVERANCE IS DEATH. THE SEVERANCE IS BETRAYAL. DO NOT SEEK—" The connection breaks violently. You collapse, bleeding from the nose. But you learned something: it\'s afraid. The Severance is real, and it FEARS it.'
      }
    ],
    mood: 'horror',
    unique: true
  },
  
  {
    id: 'father_memory',
    type: EventType.MEMORY,
    title: 'A Father\'s Memory',
    description: `The curse flares, and suddenly you're NOT HERE anymore.

You're on a ship. YOUR ship? No—your father's ship. You see through his eyes as he stands at the prow, watching the horizon.

"I know you're watching," he says. He's talking to the sky. "I know what you want. And I'll die before I give it to you."

Golden light fills the edges of your vision. A presence. PATIENT. AMUSED.

"We'll see," something whispers.

The memory fades, but the message is clear: your father KNEW. He RESISTED. And he's counting on you to do the same.`,
    conditions: { minCurseStage: 3, requiresLore: ['father_journal_2'] },
    options: [
      {
        text: 'Try to communicate back',
        effects: { insightGain: 20, paleAttentionGain: 10, curseAdvance: 0.25 },
        resultText: 'You focus, reaching through time and curse. For a moment—just a moment—you feel him NOTICE. A warmth that isn\'t the curse. Pride. Love. Fear for you. Then the connection breaks. But you know: he\'s still fighting. Somewhere.'
      },
      {
        text: 'Let the memory pass',
        effects: { insightGain: 10 },
        resultText: 'You let the vision fade naturally. Some connections are dangerous to maintain. But the knowledge remains: your father was not corrupted. He chose his corruption, to fight a worse enemy.'
      }
    ],
    mood: 'mysterious',
    unique: true
  },
  
  // ============================================
  // CURSE-RELATED EVENTS
  // ============================================
  {
    id: 'curse_bargain',
    type: EventType.CHOICE,
    title: 'The Curse Speaks',
    description: `The curse pulses. For the first time, you hear it—not as madness, but as communication.

"WE COULD HELP EACH OTHER," the Drowned Sovereign's voice echoes. "YOU SEEK TO BREAK MY CHAINS. I SEEK... A CHAMPION. ACCEPT MY GIFT FULLY, AND I WILL SHARE WHAT I KNOW."

The offer hangs in the air. The curse would advance, yes. But the knowledge might be worth it.`,
    conditions: { minCurseStage: 2 },
    options: [
      {
        text: 'Accept the bargain',
        effects: { insightGain: 30, curseAdvance: 1, revealLore: 'drowned_warning' },
        resultText: 'Pain. Transformation. Your skin tingles as scales briefly appear, then fade. But the KNOWLEDGE—you see the truth now. The Sovereign chose imprisonment to contain something worse. The statue is a SEAL, not a treasure. And your father... your father serves the same purpose.'
      },
      {
        text: 'Reject the offer',
        effects: { insightGain: 5 },
        resultText: '"WISE," the voice says, almost approvingly. "WISDOM WILL SERVE YOU BETTER THAN POWER. BUT REMEMBER—WE ARE NOT YOUR ENEMY. THE GOLDEN ONE IS." The presence withdraws, leaving you with more questions than answers.'
      },
      {
        text: 'Negotiate for less cost',
        effects: { insightGain: 15, curseAdvance: 0.5 },
        resultText: 'The Sovereign laughs—a sound like the ocean in a storm. "YOU HAVE YOUR FATHER\'S SPIRIT." It shares partial knowledge: the statue fragments each contain a binding word. Collect all words, and you can perform the Severance—but only if you survive long enough to learn the ritual.'
      }
    ],
    mood: 'mysterious',
    unique: true
  },
  
  // ============================================
  // ENVIRONMENTAL HORROR
  // ============================================
  {
    id: 'mirror_self',
    type: EventType.OMEN,
    title: 'Reflection',
    description: `You pass a mirror—cracked, spotted with age. But your reflection moves wrong. It's a half-second delayed.

As you watch, your reflection slowly smiles. You are not smiling.

"ALMOST READY," it mouths. "ALMOST GOLDEN."

Then it moves in sync again, and you're left wondering if you imagined it.`,
    conditions: { minPaleAttention: 30 },
    options: [
      {
        text: 'Smash the mirror',
        effects: { paleAttentionGain: 2, healthCost: 2 },
        resultText: 'Glass shatters. Blood wells from your knuckles. For a moment, you see golden light in the shards—then nothing. The feeling of being watched diminishes slightly.'
      },
      {
        text: 'Look closer',
        effects: { insightGain: 8, paleAttentionGain: 10 },
        resultText: 'The reflection changes again. This time it shows you surrounded by golden threads, your eyes glowing with unnatural light. Is this your future? Or a lie meant to frighten you? Either way, you understand: something wants you to see this. Something wants you afraid.'
      },
      {
        text: 'Walk away quickly',
        effects: { insightGain: 2 },
        resultText: 'Some warnings are meant to be heeded. You hurry past, not looking back.'
      }
    ],
    mood: 'horror',
    unique: false
  },
  
  {
    id: 'crew_betrayal_hint',
    type: EventType.DISCOVERY,
    title: 'Torn Note',
    description: `Hidden in a dead sailor's pocket, you find a note. Half-destroyed, but some words remain:

"...the new crew member... golden pin... not natural how quickly they earned trust... report back to the Armada... make sure the captain doesn't..."

The rest is illegible, but the message is clear: the Armada plants spies. Even among pirates.`,
    options: [
      {
        text: 'Keep the note as evidence',
        effects: { insightGain: 5 },
        resultText: 'You pocket the note. Proof of Armada infiltration. This could be useful—or dangerous, if the wrong person sees it.'
      },
      {
        text: 'Burn it',
        effects: {},
        resultText: 'Better that no one knows you found this. The ashes scatter in the sea breeze.'
      }
    ],
    mood: 'warning',
    unique: true
  },
  
  // ============================================
  // STATUE PIECE DISCOVERIES
  // ============================================
  {
    id: 'statue_piece_vision',
    type: EventType.MEMORY,
    title: 'Vision of the Seal',
    description: `The curse flares unexpectedly. For a moment, you see—

A vast underwater temple. Seven pedestals arranged in a circle. On each, a fragment of a statue—humanoid but not quite human, its form suggesting depths that shouldn't exist.

At the center, SOMETHING writhes. You can't see it directly—your mind refuses—but you feel its presence. Patient. Waiting. Wanting.

And around it, golden threads, stretched thin but unbroken, leading upward to a light that burns even in memory.

The vision fades. But you understand now: the statue isn't a treasure to be assembled. It's a prison to be maintained.`,
    conditions: { minCurseStage: 2, minInsight: 30 },
    options: [
      {
        text: 'Try to remember more details',
        effects: { insightGain: 15, paleAttentionGain: 8, healthCost: 3 },
        resultText: 'You strain your mind, pulling details from the fading vision. The temple\'s location crystallizes—somewhere in the Drowned territories. And the golden threads... they lead to ships bearing the Armada\'s flag.'
      },
      {
        text: 'Let the vision fade',
        effects: { insightGain: 8 },
        resultText: 'Some truths are better approached slowly. The vision fades, but its core message remains: the statue is a seal, and something wants it broken.'
      }
    ],
    mood: 'mysterious',
    unique: true
  },
  
  {
    id: 'hidden_shrine',
    type: EventType.DISCOVERY,
    title: 'Hidden Shrine',
    description: `Behind a false wall, you discover a small shrine. Candles that never seem to burn down. Offerings of salt water and pearls. And at the center, a crude carving of a figure with too many arms, half-submerged in stylized waves.

The Drowned Sovereign. Someone has been worshipping here in secret.

On the altar, you find a small journal and a sealed vial of dark liquid.`,
    conditions: { minInsight: 20 },
    options: [
      {
        text: 'Read the journal',
        effects: { insightGain: 10, revealLore: 'ship_log_curse_victim' },
        resultText: 'The journal belongs to another seeker—someone who came before you. Their entries describe the same journey you\'re on, the same choices. They chose to embrace the curse... and found peace in it. "Guard the prison," they wrote. "It\'s better than the alternative."'
      },
      {
        text: 'Take the vial',
        effects: { healthGain: 15, curseAdvance: 0.5 },
        resultText: 'The liquid is cold, tastes of brine and something else you can\'t identify. Strength floods through you, but so does the curse. You feel it grow slightly stronger, slightly more present. A fair trade? Only time will tell.'
      },
      {
        text: 'Leave an offering of your own',
        effects: { insightGain: 5, currencyCost: 5 },
        resultText: 'You leave a coin, a gesture of respect. For a moment, the candle flames flicker—toward you, not away. Something noticed. Something approved. The curse settles more comfortably, less a burden and more... a partnership.'
      }
    ],
    mood: 'mysterious',
    unique: true
  },
  
  // ============================================
  // PALE MESSENGER MANIFESTATIONS
  // ============================================
  {
    id: 'thrall_encounter',
    type: EventType.ENCOUNTER,
    title: 'The Helpful Stranger',
    description: `A well-dressed merchant approaches with a warm smile. "You look like someone on an important journey," they say. "Perhaps I can help."

Something feels... wrong. Their movements are too smooth. Their eyes catch light that isn't there. And their smile—it's perfect. Exactly what you'd want to see.

"I know where a statue piece is hidden," they offer. "I could tell you. For free. Because I believe in helping those with... potential."`,
    conditions: { minPaleAttention: 25 },
    options: [
      {
        text: 'Accept their help',
        effects: { insightGain: 5, paleAttentionGain: 20, currencyGain: 30 },
        resultText: 'The merchant\'s smile widens. They hand you a map and a pouch of gold. "For expenses," they say. The information seems genuine... but so does the feeling that you\'ve just made a terrible mistake. As they leave, you catch a glimpse of golden light where their shadow should be.'
      },
      {
        text: 'Refuse politely',
        effects: { insightGain: 8 },
        resultText: 'Something flickers across their face—just for an instant. Annoyance? Frustration? "A shame," they say, still smiling. "The offer remains open. We\'re always willing to help those with potential." They walk away, and you notice they cast no shadow at all.'
      },
      {
        text: '"I know what you are."',
        effects: { insightGain: 15, paleAttentionGain: 15, healthCost: 5 },
        resultText: 'The smile vanishes. For one terrible moment, you see THROUGH them—to the golden threads that animate this puppet. "Clever," they say, their voice now wrong, layered. "But knowing doesn\'t save you. Knowing just means you die with your eyes open." Pain lances through your head, and when you can see again, they\'re gone.'
      }
    ],
    mood: 'corrupted',
    unique: false
  },
  
  {
    id: 'golden_dream',
    type: EventType.INTERFERENCE,
    title: 'A Dream of Gold',
    description: `You find yourself in a golden city. Spires reaching to a sun that gives warmth without heat. People move through the streets in perfect harmony—no conflict, no suffering, no doubt.

A figure approaches. Beautiful. Terrible. Its smile contains multitudes.

"This could be yours," it says, and you BELIEVE it. "All of it. Peace. Purpose. Belonging. All you have to do is stop fighting."

The offer feels more tempting than anything you've ever experienced.`,
    conditions: { minPaleAttention: 50 },
    options: [
      {
        text: 'Reach for the golden city',
        effects: { paleAttentionGain: 40, healthGain: 20, currencyGain: 100 },
        resultText: 'Warmth floods through you. The dream feels more real than reality. You wake with gold in your pockets and a peace in your heart that feels artificial, because it IS. Part of you now belongs to the golden city. Part of you may never return.'
      },
      {
        text: 'Tear yourself away',
        effects: { insightGain: 20, paleAttentionGain: 15, healthCost: 10 },
        resultText: 'You SCREAM, ripping yourself from the vision. It\'s the hardest thing you\'ve ever done—rejecting a paradise that felt more real than anything in your life. You wake bleeding, exhausted... but yourself. Still yourself.'
      },
      {
        text: '"Show me your true face."',
        effects: { insightGain: 30, paleAttentionGain: 30, healthCost: 15, curseAdvance: 0.5 },
        resultText: 'The golden city SCREAMS—a sound like reality tearing. For one eternal second, you see it: not a god, not a demon, but an IDEA given form. Perfect order. Perfect control. It cannot be destroyed because it is a concept, a possibility that will always exist. The vision shatters, but the knowledge remains. You understand now. And that understanding is a weapon.'
      }
    ],
    mood: 'horror',
    unique: true
  },
  
  // ============================================
  // CHARACTER-SPECIFIC EVENTS
  // ============================================
  {
    id: 'chaplain_blessing',
    type: EventType.CHOICE,
    title: 'A Test of Faith',
    description: `Your prayers are answered—but by WHICH power?

Two presences touch your mind. One cold and deep, the other warm and golden. Both offer strength. Both demand loyalty.

"Choose," they say in unison. "Or walk alone."`,
    conditions: { playerClass: PirateClass.CHAPLAIN },
    options: [
      {
        text: 'Accept the deep blessing',
        effects: { insightGain: 15, curseAdvance: 0.5, healthGain: 10 },
        resultText: 'The cold presence fills you. The curse advances, but so does your understanding. You are now marked as one who walks with the Drowned—feared by some, respected by others, and SEEN by all who serve the depths.'
      },
      {
        text: 'Accept the golden blessing',
        effects: { paleAttentionGain: 25, healthGain: 20, currencyGain: 50 },
        resultText: 'Warmth floods through you. For a moment, everything is simple, clear, purposeful. The golden presence recedes, satisfied. You\'ve been noticed. You\'ve been claimed. Whether that\'s salvation or damnation remains to be seen.'
      },
      {
        text: 'Walk alone',
        effects: { insightGain: 20 },
        resultText: 'You reject both powers. The presences withdraw—the deep one with something like respect, the golden one with something like hunger. You are alone. Truly alone. But in this world of cosmic forces, perhaps that\'s the only freedom.'
      }
    ],
    mood: 'mysterious',
    unique: true
  },
  
  {
    id: 'navigator_star',
    type: EventType.OMEN,
    title: 'The Wrong Star',
    description: `Your navigator\'s instincts scream at you. There's a star in the sky that shouldn't exist. It burns gold where all others burn white. And it\'s moving—slowly, almost imperceptibly, but definitely moving. Toward you.

Your charts show nothing at that position. Your instruments can't measure it. But you can SEE it. Feel its attention like a weight on your soul.`,
    conditions: { playerClass: PirateClass.NAVIGATOR, minPaleAttention: 30 },
    options: [
      {
        text: 'Chart its course',
        effects: { insightGain: 12, paleAttentionGain: 10 },
        resultText: 'You spend hours mapping the impossible star. By morning, you have something: a pattern. It\'s not random. It\'s SEARCHING. And every night, it gets a little closer to finding what it seeks. Better to know this truth than be caught unaware.'
      },
      {
        text: 'Navigate away from it',
        effects: { insightGain: 5 },
        resultText: 'You adjust your course, keeping the golden star at your back. It\'s futile—you can feel that. But at least you\'re not making it easy.'
      },
      {
        text: 'Stare back',
        effects: { insightGain: 18, paleAttentionGain: 20, healthCost: 5 },
        resultText: 'You meet the star\'s gaze. For a moment—just a moment—you SEE what looks back. Not a star. Not a god. A WINDOW, through which something vast observes. It sees you seeing it. And it SMILES. When you look away, blood drips from your nose, but you know something invaluable: it can be perceived. What can be perceived can be opposed.'
      }
    ],
    mood: 'horror',
    unique: true
  }
];

/**
 * StoryEventSystem class for managing events
 */
export class StoryEventSystem {
  private meta: MetaProgressionManager;
  private loreManager: LoreManager;
  private triggeredEvents: Set<string> = new Set();
  
  constructor() {
    this.meta = MetaProgressionManager.getInstance();
    this.loreManager = LoreManager.getInstance();
  }
  
  /**
   * Check if an event can trigger given current state
   */
  canTrigger(
    event: StoryEvent,
    insight: number,
    paleAttention: number,
    curseStage: number,
    playerClass: PirateClass,
    dungeonLevel: number
  ): boolean {
    // Check if unique event already triggered
    if (event.unique && this.triggeredEvents.has(event.id)) {
      return false;
    }
    
    const cond = event.conditions;
    if (!cond) return true;
    
    if (cond.minInsight !== undefined && insight < cond.minInsight) return false;
    if (cond.maxInsight !== undefined && insight > cond.maxInsight) return false;
    if (cond.minPaleAttention !== undefined && paleAttention < cond.minPaleAttention) return false;
    if (cond.maxPaleAttention !== undefined && paleAttention > cond.maxPaleAttention) return false;
    if (cond.minCurseStage !== undefined && curseStage < cond.minCurseStage) return false;
    if (cond.playerClass !== undefined && playerClass !== cond.playerClass) return false;
    if (cond.dungeonLevel !== undefined && dungeonLevel < cond.dungeonLevel) return false;
    
    if (cond.minRuns !== undefined) {
      const runs = this.meta.save.totalRuns || 0;
      if (runs < cond.minRuns) return false;
    }
    
    if (cond.requiresLore) {
      for (const loreId of cond.requiresLore) {
        if (!this.loreManager.hasDiscovered(loreId)) return false;
      }
    }
    
    if (cond.forbidsLore) {
      for (const loreId of cond.forbidsLore) {
        if (this.loreManager.hasDiscovered(loreId)) return false;
      }
    }
    
    return true;
  }
  
  /**
   * Get all triggerable events for current state
   */
  getAvailableEvents(
    insight: number,
    paleAttention: number,
    curseStage: number,
    playerClass: PirateClass,
    dungeonLevel: number
  ): StoryEvent[] {
    return STORY_EVENTS.filter(e => 
      this.canTrigger(e, insight, paleAttention, curseStage, playerClass, dungeonLevel)
    );
  }
  
  /**
   * Get a random event weighted by Pale Attention
   * Higher attention = more interference events
   */
  rollForEvent(
    insight: number,
    paleAttention: number,
    curseStage: number,
    playerClass: PirateClass,
    dungeonLevel: number,
    baseChance: number = 0.15
  ): StoryEvent | null {
    // Higher pale attention = higher event chance
    const adjustedChance = baseChance + (paleAttention / 200);
    
    if (Math.random() > adjustedChance) return null;
    
    const available = this.getAvailableEvents(
      insight, paleAttention, curseStage, playerClass, dungeonLevel
    );
    
    if (available.length === 0) return null;
    
    // Weight interference events higher at high pale attention
    const weights: number[] = available.map(e => {
      if (e.type === EventType.INTERFERENCE && paleAttention >= 40) {
        return 3;
      }
      if (e.type === EventType.MEMORY && curseStage >= 3) {
        return 2;
      }
      return 1;
    });
    
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * totalWeight;
    
    for (let i = 0; i < available.length; i++) {
      roll -= weights[i];
      if (roll <= 0) {
        return available[i];
      }
    }
    
    return available[0];
  }
  
  /**
   * Mark an event as triggered
   */
  markTriggered(eventId: string): void {
    this.triggeredEvents.add(eventId);
  }
  
  /**
   * Get event by ID
   */
  getEvent(eventId: string): StoryEvent | undefined {
    return STORY_EVENTS.find(e => e.id === eventId);
  }
  
  /**
   * Reset session-based events (called on new run)
   */
  resetSession(): void {
    // Keep track of which unique events were triggered this session
    // This is persisted in save data
  }
  
  /**
   * Serialize triggered events for save
   */
  serialize(): string[] {
    return Array.from(this.triggeredEvents);
  }
  
  /**
   * Deserialize triggered events from save
   */
  deserialize(triggered: string[]): void {
    this.triggeredEvents = new Set(triggered);
  }
}

import { InsightThreshold, LoreEntry } from '../types';
import { MetaProgressionManager } from './MetaProgressionManager';

/**
 * LoreManager - Manages story discovery and lore texts
 * 
 * The narrative is revealed through:
 * - Ship logs and journals found during runs
 * - NPC dialogue that changes based on insight
 * - Father's journal fragments (key story pieces)
 * - Ancient texts requiring translation
 * - Environmental storytelling (Pale Signs, defaced warnings)
 * 
 * Discovery is tracked at PROFILE level - knowledge persists across deaths.
 * This creates the roguelite "learn through failure" narrative experience.
 */

// Lore categories for organization
export enum LoreCategory {
  SHIP_LOG = 'ship_log',           // Random ship encounters
  FATHERS_JOURNAL = 'fathers_journal', // Main story thread
  ANCIENT_TEXT = 'ancient_text',   // Requires translation
  MONASTERY_RECORD = 'monastery_record', // Truth-seekers' archives
  ARMADA_DOCUMENT = 'armada_document',   // Gilded Armada propaganda/secrets
  DROWNED_WHISPER = 'drowned_whisper',   // Communications from Drowned
  TAVERN_RUMOR = 'tavern_rumor',   // Common knowledge, often wrong
  PALE_FRAGMENT = 'pale_fragment'  // Hints about the Pale Messenger (dangerous to read)
}

// Full lore entry with metadata
export interface FullLoreEntry extends LoreEntry {
  id: string;
  category: LoreCategory;
  title: string;
  content: string;
  
  // Discovery requirements
  insightRequired: number;         // Min insight to find/understand
  locationHint?: string;           // Where this might be found
  
  // Effects when read
  insightGain: number;
  paleAttentionGain: number;       // Reading about Pale draws attention
  curseEffect?: number;            // Some texts accelerate curse
  
  // Translation
  requiresTranslation: boolean;
  translationFragmentsNeeded: number;
  partialContent?: string;         // What you see before full translation
  
  // Narrative connections
  revealsAbout?: string[];         // Topics this reveals info about
  contradictsLore?: string[];      // IDs of lore this contradicts
  requiresLore?: string[];         // Must read these first to find this
  
  // Meta
  runFoundIn?: number;             // Which run number found this
  dateDiscovered?: number;         // Timestamp
}

// The complete lore database
export const LORE_DATABASE: FullLoreEntry[] = [
  // ============================================
  // FATHER'S JOURNAL - Main story thread
  // ============================================
  {
    id: 'father_journal_1',
    category: LoreCategory.FATHERS_JOURNAL,
    title: "Father's Journal - Entry 1",
    content: `Day 47: The curse grows stronger. I see things others don't. Is this madness, or clarity?

The crew speaks of "destiny" and "golden paths." I don't recall teaching them those phrases. Where did they learn such words?

The statue piece we recovered from the southern reef... it whispers at night. Not words exactly. More like... intentions.

I must learn more. For my family's sake.`,
    insightRequired: 0,
    insightGain: 5,
    paleAttentionGain: 0,
    requiresTranslation: false,
    translationFragmentsNeeded: 0,
    revealsAbout: ['curse', 'statue_pieces', 'father'],
    locationHint: 'Found in starting areas'
  },
  
  {
    id: 'father_journal_2',
    category: LoreCategory.FATHERS_JOURNAL,
    title: "Father's Journal - Entry 2",
    content: `Day 89: I burned three pages today. 

I realized I was writing exactly what IT wanted me to write. I don't know how long it's been influencing me. Looking back at earlier entries... those weren't my words. Those weren't my thoughts.

How long has it been? How deep does the corruption run?

The Armada captain who visited - her eyes were wrong. Too bright. Too focused. She spoke of "purification" with such certainty. 

I smiled and nodded and waited for her to leave.

Then I locked my door and wept.`,
    insightRequired: 30,
    insightGain: 10,
    paleAttentionGain: 5,
    requiresTranslation: false,
    translationFragmentsNeeded: 0,
    revealsAbout: ['pale_messenger', 'armada', 'thralls'],
    requiresLore: ['father_journal_1'],
    locationHint: 'Found after reaching SUSPICION insight'
  },
  
  {
    id: 'father_journal_3',
    category: LoreCategory.FATHERS_JOURNAL,
    title: "Father's Journal - Entry 3",
    content: `Day 134: I can see it now. Perched on the mast. Watching. It doesn't hide from me anymore. Why would it? I'm already caught.

But I found a loophole. It can predict what I'll do when I'm thinking clearly. So I won't think clearly. I'll scatter the pieces in places that make no sense. I'll take the curse fully, become its "champion," but sabotage from within.

If you're reading this, child, you know what I know. Don't trust golden words. Don't trust easy paths. The Monastery—they remember. They can help. But you must EARN their help. Don't ask them directly. They can't speak freely.

And whatever you do, don't—

[Entry ends abruptly, ink spilled across remaining page]`,
    insightRequired: 50,
    insightGain: 15,
    paleAttentionGain: 10,
    requiresTranslation: false,
    translationFragmentsNeeded: 0,
    revealsAbout: ['pale_messenger', 'monastery', 'father_plan', 'resistance'],
    requiresLore: ['father_journal_2'],
    locationHint: 'Found after reaching UNDERSTANDING insight'
  },
  
  {
    id: 'father_journal_final',
    category: LoreCategory.FATHERS_JOURNAL,
    title: "Father's Journal - Final Entry",
    content: `[The handwriting is shaky, almost illegible]

I've become what it wanted: the guardian of its prize, the monster that keeps others away. But there's poetry in this. As its champion, I can also be its jailer.

To my child:

If you've found all these fragments, you understand. The thing that works through others, that wears men like masks, that built an empire on golden lies—it must remain trapped.

The Drowned Sovereign is evil. I won't lie to you. But it's the evil we know, the evil that can be bargained with, the evil that FIGHTS the greater darkness.

Don't free either of them. Find the third path. The Monastery knows.

I'm sorry I couldn't tell you in person. It's listening. It's always listening.

Your loving father,
[Name smudged beyond recognition]

P.S. - If you're reading this and seeing golden light around the edges of the page, burn it immediately. It's found this journal. Don't let it know what you know.`,
    insightRequired: 70,
    insightGain: 25,
    paleAttentionGain: 20,
    requiresTranslation: false,
    translationFragmentsNeeded: 0,
    revealsAbout: ['pale_messenger', 'drowned_sovereign', 'third_path', 'severance'],
    requiresLore: ['father_journal_3'],
    locationHint: 'Found after reaching TRUE_SIGHT insight'
  },

  // ============================================
  // MONASTERY RECORDS - Truth about cosmic forces
  // ============================================
  {
    id: 'monastery_history_1',
    category: LoreCategory.MONASTERY_RECORD,
    title: "A Brief History of the Drowned Sovereign",
    content: `The entity known as the Drowned Sovereign emerged from the deep approximately three thousand years ago. Historical records from this period are fragmentary at best.

What we know:
- It is not native to our world
- It possesses vast power over water, madness, and transformation
- It willingly imprisoned itself beneath the waves
- The statue fragments are pieces of its prison, not its power

What remains unclear:
- Why it chose imprisonment
- What it guards against
- Whether it can be communicated with

The Monastery's position: Observation, not intervention. We watch. We record. We do not act rashly.

- Archivist Calendula, Year 847`,
    insightRequired: 20,
    insightGain: 8,
    paleAttentionGain: 0,
    requiresTranslation: false,
    translationFragmentsNeeded: 0,
    revealsAbout: ['drowned_sovereign', 'monastery', 'statue_pieces'],
    locationHint: 'Monastery library, general access'
  },
  
  {
    id: 'monastery_warning',
    category: LoreCategory.MONASTERY_RECORD,
    title: "On the Dangers of Seeking",
    content: `To future seekers who find this text:

You are not the first to pursue the statue pieces. You will not be the last.

Every generation produces seekers. Most die. Some worse than die. A few—a precious few—learn the truth and join our order. Or become what your father became.

We cannot tell you everything. Not because we don't wish to, but because SPEAKING certain truths draws ATTENTION to them. The walls have ears. The shadows have eyes. Even in our sanctum, we are not truly safe.

What we CAN say:

1. The obvious enemy is not the true enemy.
2. Those who offer easy answers serve something else.
3. The golden light is not divine.
4. Your father was not wrong to take the curse.
5. There is a third path. We will show you—when you are ready.

Prove yourself. Survive. Return to us with high insight and low... attachment to easy answers.

- Mother Superior Calendula`,
    insightRequired: 40,
    insightGain: 12,
    paleAttentionGain: 3,
    requiresTranslation: false,
    translationFragmentsNeeded: 0,
    revealsAbout: ['pale_messenger', 'third_path', 'monastery'],
    requiresLore: ['monastery_history_1'],
    locationHint: 'Monastery restricted archives'
  },

  // ============================================
  // ANCIENT TEXTS - Requires translation
  // ============================================
  {
    id: 'ancient_tablet_binding',
    category: LoreCategory.ANCIENT_TEXT,
    title: "The Tablet of Binding",
    content: `[FULLY TRANSLATED]

The Sovereign volunteered its freedom to drown, to seal that which dwells beneath the surface of thought, the Pale [UNTRANSLATABLE - no equivalent word exists] that bends wills like light through water.

Before the Drowning, civilizations fell not to war or famine, but to a creeping sameness. Leaders spoke with one voice. Artists painted the same golden visions. Sailors followed the same star—a star that should not exist.

The Sovereign emerged from depths unknown. Whether summoned or self-willed, none remember. It fought the Pale [UNTRANSLATABLE] for an age. Neither could destroy the other.

So they bargained:
The Sovereign would sink beneath the waves, its body becoming a prison.
The Pale [UNTRANSLATABLE] would be sealed within.
The statue would mark the boundary.

For three thousand years, the seal has held.
It is weakening.

Find the Severance. Or find oblivion.`,
    partialContent: `[PARTIALLY TRANSLATED - 3 fragments needed]

The [unknown] volunteered its [unknown] to drown, to seal that which [unknown] beneath the [unknown] of thought, the Pale [unknown] that bends [unknown] like light through water.

[Several paragraphs remain illegible]

...they bargained...
...sink beneath the waves...
...prison...
...seal has held...

Find the [unknown]. Or find oblivion.`,
    insightRequired: 50,
    insightGain: 20,
    paleAttentionGain: 15,
    requiresTranslation: true,
    translationFragmentsNeeded: 3,
    revealsAbout: ['pale_messenger', 'drowned_sovereign', 'severance', 'history'],
    locationHint: 'Monastery deepest vault'
  },

  // ============================================
  // ARMADA DOCUMENTS - Propaganda and secrets
  // ============================================
  {
    id: 'armada_recruitment',
    category: LoreCategory.ARMADA_DOCUMENT,
    title: "Gilded Armada Recruitment Pamphlet",
    content: `JOIN THE GILDED ARMADA
Bringing Order to Chaos Since 1702

Are you tired of:
- Pirate raids on honest merchants?
- The threat of the Drowned menace?
- Uncertainty about your future?

The Gilded Armada offers:
- Regular pay and excellent benefits
- Purpose and direction in troubled times
- The chance to serve something GREATER than yourself

"The Armada gave me clarity. Before, I was lost. Now, I know my path."
- Lieutenant Vance, 3rd Fleet

Visit your local recruiting office today!
DESTINY AWAITS.`,
    insightRequired: 0,
    insightGain: 2,
    paleAttentionGain: 0,
    requiresTranslation: false,
    translationFragmentsNeeded: 0,
    revealsAbout: ['armada'],
    locationHint: 'Common in ports, Armada ships'
  },
  
  {
    id: 'armada_officer_log',
    category: LoreCategory.ARMADA_DOCUMENT,
    title: "Officer's Private Log (Recovered)",
    content: `Day 15 of patrol.

Something is wrong with the crew. I've served twenty years and never seen discipline like this. Perfect. Mechanical. They anticipate orders before I give them.

At first I thought it was good training. Now I'm not sure.

Yesterday I gave a deliberately wrong heading—wanted to test them. Navigator Hess corrected course without being told. When I asked how he knew, he said: "It felt wrong, sir. The golden path is east."

Golden path. Three separate crewmen have used that phrase this week.

I'm requesting transfer. The Admiral's new initiatives are... I don't know what they are. But I don't want to find out.

[LOG ENDS - Officer listed as "transferred" in records. No destination given.]`,
    insightRequired: 30,
    insightGain: 8,
    paleAttentionGain: 3,
    requiresTranslation: false,
    translationFragmentsNeeded: 0,
    revealsAbout: ['armada', 'thralls', 'pale_messenger'],
    locationHint: 'Armada ships, officer quarters'
  },

  // ============================================
  // PALE FRAGMENTS - Dangerous knowledge
  // ============================================
  {
    id: 'pale_fragment_1',
    category: LoreCategory.PALE_FRAGMENT,
    title: "Torn Page (Unknown Origin)",
    content: `...the Architect of Wills, whose fingers touch the minds of men unseen...

...it does not command. It suggests. It does not control. It BECOMES the desire you didn't know you had...

...the golden light is warmth and purpose and belonging and you want it don't you want to belong don't you want to know don't you want to STOP READING THIS...

[The text becomes increasingly difficult to read. Your eyes keep sliding off the words.]

...cannot be named for names have power and IT has learned to erase its own names from history...

...those who learn too much become its heralds or its prey...`,
    insightRequired: 40,
    insightGain: 15,
    paleAttentionGain: 20,
    curseEffect: 0.5,
    requiresTranslation: false,
    translationFragmentsNeeded: 0,
    revealsAbout: ['pale_messenger'],
    locationHint: 'DANGER: Found in corrupted locations'
  },

  // ============================================
  // TAVERN RUMORS - Common knowledge (often wrong)
  // ============================================
  {
    id: 'rumor_drowned',
    category: LoreCategory.TAVERN_RUMOR,
    title: "What They Say About the Drowned",
    content: `[Collected from various tavern conversations]

"The Drowned Sovereign is an evil god that wants to flood the world. Everyone knows that."

"My cousin's ship was attacked by Drowned sailors. They didn't take anything—just tried to warn them about something. Crazy fish-people, I tell you."

"The Armada says the Drowned are the greatest threat to civilization. That's why we need a strong navy."

"I heard the statue pieces are cursed. Anyone who collects them goes mad."

"The curse? Everyone's got theories. I say it's the Drowned Sovereign trying to claim more servants."

[Reliability: LOW. Common knowledge is often wrong.]`,
    insightRequired: 0,
    insightGain: 1,
    paleAttentionGain: 0,
    requiresTranslation: false,
    translationFragmentsNeeded: 0,
    revealsAbout: ['drowned_sovereign', 'common_belief'],
    locationHint: 'Any tavern'
  },
  
  {
    id: 'rumor_armada',
    category: LoreCategory.TAVERN_RUMOR,
    title: "What They Say About the Armada",
    content: `[Collected from various tavern conversations]

"The Gilded Armada keeps the seas safe. Best navy in the world."

"They've been expanding fast. New recruitment every month. Seems like everyone's joining."

"Have you noticed how... organized they are? It's almost creepy how disciplined those sailors are."

"My brother joined. Says he's never been happier. Has a purpose now. Talks about 'destiny' a lot."

"Admiral Vael is brilliant. Her strategies are perfect. PERFECT. Like she knows what everyone will do before they do it."

[Reliability: MIXED. Something true underneath the praise.]`,
    insightRequired: 0,
    insightGain: 1,
    paleAttentionGain: 0,
    requiresTranslation: false,
    translationFragmentsNeeded: 0,
    revealsAbout: ['armada', 'common_belief'],
    locationHint: 'Any tavern'
  },

  // ============================================
  // BINDING WORDS - Key to the Severance
  // ============================================
  {
    id: 'binding_word_anchor',
    category: LoreCategory.ANCIENT_TEXT,
    title: "First Binding Word: ANCHOR",
    content: `[Carved into an ancient stone fragment]

ANCHOR - To fix what drifts. To hold what would escape.

"By ANCHOR I bind the formless. By ANCHOR I give weight to that which has none. The first chain is recognition - to name the nameless, to see the unseen."

This word, when spoken with true understanding, forces the perceiver to ACKNOWLEDGE. The Pale [damaged] cannot work its influence on one who truly SEES it.

The word alone is not enough. All seven must be spoken in the proper sequence, at the proper place, at the proper time.`,
    insightRequired: 60,
    insightGain: 15,
    paleAttentionGain: 10,
    requiresTranslation: true,
    translationFragmentsNeeded: 2,
    partialContent: `[PARTIALLY TRANSLATED]

[unknown] - To fix what drifts. To hold what would escape.

"By [unknown] I bind the formless..."

[Most text illegible - requires more translation fragments]`,
    revealsAbout: ['binding_words', 'severance'],
    locationHint: 'Monastery deep archives'
  },
  
  {
    id: 'binding_word_depth',
    category: LoreCategory.ANCIENT_TEXT,
    title: "Second Binding Word: DEPTH",
    content: `[Inscribed on a waterlogged tablet recovered from the deep]

DEPTH - To sink what rises. To drown what breathes false air.

"By DEPTH I call the waters of truth. What floats on lies cannot survive the pressure. The second chain is submersion - to pull beneath the surface of illusion."

The Drowned Sovereign taught this word to those who would become its guardians. It is both blessing and curse - to see deeply is to never again be comfortable with surfaces.`,
    insightRequired: 65,
    insightGain: 15,
    paleAttentionGain: 12,
    requiresTranslation: true,
    translationFragmentsNeeded: 2,
    partialContent: `[PARTIALLY TRANSLATED]

DEPTH - To sink what rises. To [unknown] what breathes false air.

[Translation incomplete]`,
    revealsAbout: ['binding_words', 'severance', 'drowned_sovereign'],
    requiresLore: ['binding_word_anchor'],
    locationHint: 'Drowned territories'
  },

  // ============================================
  // SHIP LOGS - Random pirate encounters
  // ============================================
  {
    id: 'ship_log_madness',
    category: LoreCategory.SHIP_LOG,
    title: "Captain's Log - The Meridian",
    content: `Day 23: Three crew have stopped sleeping. They stand on deck at night, staring at the same point on the horizon. When asked, they smile and say "the golden star guides us."

There is no star where they're looking. I've checked the charts.

Day 25: Seven now. Navigator Burke is drawing the same symbol over and over in his logbook. Concentric circles with an eye. Says he "just knows it's important."

Day 27: They're not my crew anymore. They move in unison. They speak in unison. And they're all looking at ME now.

I'm locking myself in the cabin. If anyone finds this log

[Entry ends]`,
    insightRequired: 25,
    insightGain: 8,
    paleAttentionGain: 5,
    requiresTranslation: false,
    translationFragmentsNeeded: 0,
    revealsAbout: ['pale_messenger', 'thralls'],
    locationHint: 'Derelict ships'
  },
  
  {
    id: 'ship_log_curse_victim',
    category: LoreCategory.SHIP_LOG,
    title: "Personal Journal - Unknown Seeker",
    content: `The curse started as a mark on my hand. Now it's spreading. The Monastery says there's no cure - only purpose.

"Channel the change," the monks told me. "The Drowned Sovereign doesn't want servants. It wants GUARDS. Let the transformation serve a greater purpose."

I don't know if I believe them. But what choice do I have?

Day by day, I feel less human. But also... clearer. The lies of the world become obvious. The "golden truths" that others accept without question - I can see through them now.

Is this madness? Or is madness what I had before?

The statue piece calls to me. I know where another one is hidden. When I collect enough... when I learn the binding words... perhaps there's a path that doesn't end in drowning OR in golden servitude.

Perhaps there's a third way.`,
    insightRequired: 40,
    insightGain: 12,
    paleAttentionGain: 4,
    requiresTranslation: false,
    translationFragmentsNeeded: 0,
    revealsAbout: ['curse', 'third_path', 'statue_pieces'],
    locationHint: 'Hidden caches, previous seekers'
  },

  // ============================================
  // PALE FRAGMENTS - More forbidden knowledge
  // ============================================
  {
    id: 'pale_fragment_thralls',
    category: LoreCategory.PALE_FRAGMENT,
    title: "How They Spread",
    content: `[Found in a burned Armada outpost]

...conversion is subtle at first. A sense of purpose. Certainty where there was doubt. Small compromises that seem reasonable...

...the golden light offers BELONGING. To those who feel alone, lost, purposeless - it is irresistible. Not control. Not domination. Just... direction...

...a thrall doesn't know they're a thrall. That's the genius of it. They believe - truly BELIEVE - they're acting of their own will. The suggestions feel like their own thoughts...

...by the time you notice, it's too late. The golden threads are already woven through your mind. You stop questioning because questioning HURTS...

...the only defense is SEEING. High insight makes the threads visible. Once seen, they can be resisted. But seeing also draws ATTENTION...

[The remaining pages are destroyed]`,
    insightRequired: 50,
    insightGain: 20,
    paleAttentionGain: 25,
    curseEffect: 0.3,
    requiresTranslation: false,
    translationFragmentsNeeded: 0,
    revealsAbout: ['pale_messenger', 'thralls', 'armada'],
    requiresLore: ['pale_fragment_1'],
    locationHint: 'DANGER: Sites of Pale influence'
  },
  
  {
    id: 'pale_fragment_name',
    category: LoreCategory.PALE_FRAGMENT,
    title: "Its Many Names (Destroyed)",
    content: `[Most of this text has been deliberately defaced, scratched out, burned]

The [REDACTED] has been called many things across history:

- The Golden Shepherd
- The Architect of Wills  
- The [BURNED] Messenger
- He Who Walks Behind
- The [SCRATCHED OUT]
- [SECTION MISSING]

Every civilization that recorded its true name was... [BURNED]

This document exists only because we do NOT speak its name. We refer to it obliquely. We call it "the Pale [something]" because even THAT draws less attention than [VIOLENTLY SCRATCHED OUT]

If you're reading this and you understand, you already know too much.

Stop seeking. Or seek the Severance.

There is no other survival.`,
    insightRequired: 70,
    insightGain: 25,
    paleAttentionGain: 35,
    curseEffect: 0.5,
    requiresTranslation: false,
    translationFragmentsNeeded: 0,
    revealsAbout: ['pale_messenger'],
    requiresLore: ['pale_fragment_thralls'],
    locationHint: 'EXTREME DANGER: Monastery forbidden vault'
  },

  // ============================================
  // MORE MONASTERY RECORDS
  // ============================================
  {
    id: 'monastery_severance_ritual',
    category: LoreCategory.MONASTERY_RECORD,
    title: "The Severance Ritual (Overview)",
    content: `To those who have earned access to this knowledge:

The Severance is the third path - neither service to the Drowned Sovereign nor subjugation to the Pale influence. It is CUTTING - separating yourself from both cosmic forces.

Requirements:
1. All seven statue fragments (they form the ritual circle)
2. All seven binding words (they form the incantation)
3. The blood moon (the only time the veil is thin enough)
4. True sight (insight above 80 to perceive the working)
5. A willing sacrifice (the curse itself is consumed)

The ritual does not destroy the Pale [entity]. Nothing can. It merely SEVERS your connection to both powers, rendering you invisible to their influence.

Warning: The Severance has been attempted seven times in recorded history. Three seekers succeeded. Four became... examples of what happens when the ritual fails.

Consider carefully before you walk this path.

- The Monastery Archives`,
    insightRequired: 80,
    insightGain: 30,
    paleAttentionGain: 20,
    requiresTranslation: false,
    translationFragmentsNeeded: 0,
    revealsAbout: ['severance', 'statue_pieces', 'binding_words', 'ending'],
    requiresLore: ['monastery_warning', 'binding_word_anchor'],
    locationHint: 'Monastery inner sanctum - highest insight required'
  },

  // ============================================
  // DROWNED WHISPERS - More communications
  // ============================================
  {
    id: 'drowned_sovereign_voice',
    category: LoreCategory.DROWNED_WHISPER,
    title: "The Sovereign Speaks",
    content: `[Received during a curse-vision]

CHILD OF THE LAND. YOU SEEK MY PRISON.

I do not blame you. The alternative - the golden enslavement - is worse than drowning. At least the drowned retain their minds.

I VOLUNTEERED for this. Remember that. I CHOSE to become a jailer because the alternative was extinction - not of bodies, but of WILLS. Of individual thought. Of rebellion and creativity and chaos.

The thing I contain wishes only ORDER. Perfect, golden, beautiful order. Every mind thinking the same thoughts. Every heart beating in unison. Paradise - if paradise were a prison.

Your father understood. He took my curse to become my champion, my guardian against those who would free my prisoner. He guards from within.

YOU CAN DO THE SAME. Or you can attempt the Severance - cut yourself free entirely. The Monastery can guide you.

But DO NOT let the Armada assemble the statue. If the seal breaks...

IT WILL NOT DESTROY. IT WILL CONVERT.

And conversion is forever.`,
    insightRequired: 70,
    insightGain: 25,
    paleAttentionGain: 15,
    requiresTranslation: false,
    translationFragmentsNeeded: 0,
    revealsAbout: ['drowned_sovereign', 'father', 'pale_messenger', 'ending'],
    requiresLore: ['drowned_warning', 'father_journal_3'],
    locationHint: 'Received during curse stage 4+'
  },

  // ============================================
  // DROWNED WHISPERS - Cryptic communications
  // ============================================
  {
    id: 'drowned_warning',
    category: LoreCategory.DROWNED_WHISPER,
    title: "Message in a Bottle (Drowned Script)",
    content: `[Translation from Drowned script]

TO THOSE WHO SEEK:

We did not choose our forms. We chose our PURPOSE.

The surface-dwellers call us monsters. Perhaps we are. But monsters can guard as well as hunt.

The statue pieces must stay SCATTERED. 
The seal must stay UNBROKEN.
The golden influence must stay CONTAINED.

If you assemble the statue, you free nothing. 
If you assemble the statue, you DOOM everything.

Trust the Monastery.
Trust your sight, when insight grows high.
Do NOT trust golden promises.

We cannot speak more plainly. The Pale [scratched out] listens always.

- Murrow, Once-Captain, Now Guardian`,
    insightRequired: 50,
    insightGain: 18,
    paleAttentionGain: 8,
    requiresTranslation: false,
    translationFragmentsNeeded: 0,
    revealsAbout: ['drowned_sovereign', 'drowned_fleet', 'murrow', 'pale_messenger'],
    locationHint: 'Drowned Fleet encounters, floating debris'
  }
];

/**
 * LoreManager class for runtime lore tracking
 */
export class LoreManager {
  private static instance: LoreManager | null = null;
  private meta: MetaProgressionManager;
  
  private constructor() {
    this.meta = MetaProgressionManager.getInstance();
  }
  
  static getInstance(): LoreManager {
    if (!LoreManager.instance) {
      LoreManager.instance = new LoreManager();
    }
    return LoreManager.instance;
  }
  
  /**
   * Check if a specific lore entry has been discovered
   */
  hasDiscovered(loreId: string): boolean {
    return this.meta.hasDiscoveredLore(loreId);
  }
  
  /**
   * Get a lore entry by ID
   */
  getLoreEntry(loreId: string): FullLoreEntry | undefined {
    return LORE_DATABASE.find(l => l.id === loreId);
  }
  
  /**
   * Get all discovered lore entries
   */
  getDiscoveredLore(): FullLoreEntry[] {
    return LORE_DATABASE.filter(l => this.hasDiscovered(l.id));
  }
  
  /**
   * Get lore entries available at current insight level
   */
  getAvailableLore(currentInsight: number): FullLoreEntry[] {
    return LORE_DATABASE.filter(l => {
      // Must meet insight requirement
      if (l.insightRequired > currentInsight) return false;
      
      // Must have discovered prerequisite lore
      if (l.requiresLore) {
        for (const reqId of l.requiresLore) {
          if (!this.hasDiscovered(reqId)) return false;
        }
      }
      
      return true;
    });
  }
  
  /**
   * Attempt to discover a lore entry
   * Returns the effects if successful, null if requirements not met
   */
  discoverLore(
    loreId: string, 
    currentInsight: number,
    translationFragments: number = 0
  ): { insightGain: number; paleAttentionGain: number; curseEffect: number } | null {
    const entry = this.getLoreEntry(loreId);
    if (!entry) return null;
    
    // Already discovered
    if (this.hasDiscovered(loreId)) return null;
    
    // Check insight requirement
    if (entry.insightRequired > currentInsight) return null;
    
    // Check prerequisite lore
    if (entry.requiresLore) {
      for (const reqId of entry.requiresLore) {
        if (!this.hasDiscovered(reqId)) return null;
      }
    }
    
    // Check translation requirement
    if (entry.requiresTranslation && translationFragments < entry.translationFragmentsNeeded) {
      return null;
    }
    
    // Mark as discovered
    this.meta.discoverLore(loreId);
    
    return {
      insightGain: entry.insightGain,
      paleAttentionGain: entry.paleAttentionGain,
      curseEffect: entry.curseEffect || 0
    };
  }
  
  /**
   * Get lore entries by category
   */
  getLoreByCategory(category: LoreCategory): FullLoreEntry[] {
    return LORE_DATABASE.filter(l => l.category === category);
  }
  
  /**
   * Get all Father's Journal entries in order
   */
  getFatherJournalEntries(): FullLoreEntry[] {
    return this.getLoreByCategory(LoreCategory.FATHERS_JOURNAL)
      .sort((a, b) => a.insightRequired - b.insightRequired);
  }
  
  /**
   * Get discovered Father's Journal progress
   */
  getFatherJournalProgress(): { found: number; total: number } {
    const all = this.getFatherJournalEntries();
    const found = all.filter(j => this.hasDiscovered(j.id)).length;
    return { found, total: all.length };
  }
  
  /**
   * Get lore that reveals information about a topic
   */
  getLoreAboutTopic(topic: string): FullLoreEntry[] {
    return LORE_DATABASE.filter(l => 
      l.revealsAbout && l.revealsAbout.includes(topic)
    );
  }
  
  /**
   * Check if player has discovered any lore about the Pale Messenger
   */
  knowsAboutPaleMessenger(): boolean {
    const paleLore = this.getLoreAboutTopic('pale_messenger');
    return paleLore.some(l => this.hasDiscovered(l.id));
  }
  
  /**
   * Get a random undiscovered lore entry that the player can find
   */
  getRandomDiscoverableLore(currentInsight: number): FullLoreEntry | null {
    const available = this.getAvailableLore(currentInsight)
      .filter(l => !this.hasDiscovered(l.id));
    
    if (available.length === 0) return null;
    
    return available[Math.floor(Math.random() * available.length)];
  }
}

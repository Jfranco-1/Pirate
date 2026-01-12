# Phase 5: Run Management - Research

**Researched:** 2026-01-12
**Domain:** Roguelite run tracking and management
**Confidence:** HIGH

<research_summary>
## Summary

Most run management features are already implemented through earlier phases:
- ✅ Permadeath: Player death ends run, returns to hub
- ✅ Run tracking: Lifetime stats in MetaProgressionManager
- ✅ Progression visibility: HubScene shows all stats
- ✅ Victory condition: Clear all enemies for bonus

**Remaining polish opportunities:**
1. Reset save button in HubScene (currently missing)
2. Controls help text in HubScene
3. Run counter display during gameplay
4. Better transition effects between scenes

Phase 5 is polish work - the core roguelite loop is functional.
</research_summary>

<implementation_notes>
## What's Already Done

### From Phase 4:
- HubScene with class selection, upgrades, unlocks
- Death screen with run summary
- Victory screen with bonus
- Return to hub flow

### From MetaProgressionManager:
- runsStarted, runsEnded tracking
- enemiesKilled, currencyEarned totals
- localStorage persistence
- resetSave() method exists

## Remaining Polish

1. **Reset Save Button:** Add to HubScene with confirmation
2. **Controls Help:** Show movement/item keys in HubScene or GameScene
3. **Scene Transitions:** Fade effects for smoother flow
</implementation_notes>

---

*Phase: 05-run-management*
*Research completed: 2026-01-12*
*Status: Optional polish - core features complete*

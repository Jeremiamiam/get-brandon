---
phase: 04-ai-on-real-data-context-builders-migration
plan: 05
subsystem: ui
tags: [react, nextjs, tailwind, chat, mock-deletion]

# Dependency graph
requires:
  - phase: 04-04
    provides: async context builders (agency/client/project) on real Supabase data
provides:
  - AgencyChatDrawer component with agency-scope Brandon chat accessible from GlobalNav
  - GlobalNav Brandon button wired to AgencyChatDrawer
  - ClientChatDrawer rewritten without mock dependency (uses useChat + clientId from pathname)
  - mock.ts deleted (ARCH-5 complete)
  - doc-content.ts deleted
  - DocumentViewer simplified to note + PDF + generic fallback (no mock content)
affects: [all phases using GlobalNav, any future chat extensions]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - AgencyChatDrawer: inline useChat({ contextType:'agency' }) in slide-over drawer — state resets on unmount (no persistence needed)
    - ClientChatDrawer: inline useChat({ contextType:'client', clientId }) directly — removes dependency on Client object for cosmetic header only
    - DocumentViewer: simplified to note > PDF > generic fallback — no mock content stubs

key-files:
  created:
    - dashboard/src/components/AgencyChatDrawer.tsx
  modified:
    - dashboard/src/components/GlobalNav.tsx
    - dashboard/src/components/ClientChatDrawer.tsx
    - dashboard/src/components/DocumentViewer.tsx
  deleted:
    - dashboard/src/lib/mock.ts
    - dashboard/src/lib/doc-content.ts
    - dashboard/src/components/tabs/ProduitsTab.tsx

key-decisions:
  - "ClientChatDrawer inlines chat UI directly rather than wrapping ClientChatTab — avoids passing a dummy Client object just for cosmetic header name"
  - "ProduitsTab.tsx deleted (dead code — BudgetsTab replaced it, ProduitsTab had zero importers)"
  - "DocumentViewer mock content fallback removed — PLATFORM_CONTENT/BRIEF_CONTENT were only meaningful for mock doc IDs; real Supabase docs use note (content) or storagePath"

patterns-established:
  - "Agency chat: useChat({ contextType: 'agency' }) in a 'use client' drawer component — scope is stateless, resets on close"

requirements-completed: [AI-1, ARCH-5]

# Metrics
duration: 25min
completed: 2026-03-09
---

# Phase 04 Plan 05: Agency Chat + Mock Deletion Summary

**AgencyChatDrawer added to GlobalNav, mock.ts and doc-content.ts deleted — app runs entirely on Supabase data (ARCH-5 complete)**

## Performance

- **Duration:** ~25 min
- **Started:** 2026-03-09T21:00:00Z
- **Completed:** 2026-03-09T21:25:00Z
- **Tasks:** 2/3 complete (Task 3 is a human-verify checkpoint — awaiting user)
- **Files modified:** 6 (including 3 deletions)

## Accomplishments
- Created `AgencyChatDrawer.tsx` — slide-over drawer with `useChat({ contextType: 'agency' })`, emerald color theme, resets on close (no persistence)
- Wired `GlobalNav` with Brandon button (emerald) + `AgencyChatDrawer` open/close state
- Rewrote `ClientChatDrawer` to eliminate `getClient()` mock call — inlines chat panel with `useChat({ contextType: 'client', clientId })` using pathname-derived clientId
- Removed `PLATFORM_CONTENT`/`BRIEF_CONTENT` from `DocumentViewer` — simplified to note > PDF > generic fallback
- Deleted `mock.ts` (725 lines) and `doc-content.ts` — zero remaining `@/lib/mock` or `@/lib/doc-content` imports
- `npm run build` and `tsc --noEmit` both pass cleanly after deletion

## Task Commits

1. **Task 1: AgencyChatDrawer + GlobalNav + mock consumer fixes** - `b20d896` (feat)
2. **Task 2: Delete mock.ts and doc-content.ts** - `44a78c8` (feat)
3. **Task 3: Human verify** - checkpoint — awaiting user approval

## Files Created/Modified
- `dashboard/src/components/AgencyChatDrawer.tsx` — NEW: slide-over agency chat drawer, `useChat({ contextType: 'agency' })`
- `dashboard/src/components/GlobalNav.tsx` — Brandon button + AgencyChatDrawer wired via useState
- `dashboard/src/components/ClientChatDrawer.tsx` — rewritten: removed mock import, inlined chat panel using useChat directly
- `dashboard/src/components/DocumentViewer.tsx` — removed doc-content.ts import and PlatformContent/BriefContent sub-components
- `dashboard/src/lib/mock.ts` — DELETED (ARCH-5)
- `dashboard/src/lib/doc-content.ts` — DELETED
- `dashboard/src/components/tabs/ProduitsTab.tsx` — DELETED (dead code, zero importers)

## Decisions Made
- `ClientChatDrawer` inlines the chat UI directly using `useChat({ contextType: 'client', clientId })` rather than wrapping `ClientChatTab` — avoids the need to construct a full `Client` object just to show a cosmetic header name.
- `ProduitsTab.tsx` deleted entirely — it was dead code with zero importers. `BudgetsTab` is the actual "produits" tab rendered by `ProjectPageShell`.
- `DocumentViewer` mock content fallback removed — `PLATFORM_CONTENT`/`BRIEF_CONTENT` keys mapped to mock doc IDs (`g1`, `g3`, `g4`, `d1`, `d4`, `d5`); real Supabase documents use `content` (note field) or `storagePath` (PDF), so the fallback is now `GenericDocContent`.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 2 - Missing Critical] Fixed DocumentViewer doc-content.ts dependency not covered in plan**
- **Found during:** Task 2 (pre-deletion import check)
- **Issue:** Plan only mentioned `ClientChatDrawer` and `ProduitsTab` as mock consumers, but `DocumentViewer` also imported from `doc-content.ts`
- **Fix:** Removed `PLATFORM_CONTENT`/`BRIEF_CONTENT` imports, dropped `PlatformContent`/`BriefContent` sub-components, simplified viewer to note > PDF > generic fallback
- **Files modified:** `dashboard/src/components/DocumentViewer.tsx`
- **Verification:** Build passes, tsc clean, zero doc-content imports remain
- **Committed in:** b20d896 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (Rule 2 — missing critical dependency)
**Impact on plan:** Essential fix — without it, deleting doc-content.ts in Task 2 would break the build. No scope creep.

## Issues Encountered
None — build passed on first attempt for both task commits.

## Next Phase Readiness
- Phase 04 automation complete. Human verification of 3 chat scopes pending (Task 3 checkpoint).
- After approval: Phase 04 milestone fully achieved — all 3 AI chat scopes use real Supabase data, mock.ts deleted, agency chat accessible globally.

---
*Phase: 04-ai-on-real-data-context-builders-migration*
*Completed: 2026-03-09*

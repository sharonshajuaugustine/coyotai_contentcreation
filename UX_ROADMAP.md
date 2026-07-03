# Coyot AI Idea Pool — UI/UX Roadmap

Curated improvement backlog for the idea pool app. Grouped by category, each item is
concrete and scoped to this codebase (glass/neumorphic bento system, Supabase, OpenRouter).
No duplicates — if two ideas overlapped, they were merged into one. Priority: **P0** = do
soon (high impact / low effort), **P1** = solid next-wave, **P2** = nice-to-have / later.

Checkboxes double as an implementation tracker — check them off as you build.

---

## A. Visual System & Glass/Neumorphism

- [ ] A1 (P0) Extract repeated glass/neumorph values (blur amount, shadow pairs, border tint) into Tailwind `@theme` tokens instead of hardcoded `color-mix()` calls in `globals.css`, so intensity is tunable in one place.
- [ ] A2 (P1) Add a "glass intensity" scale (subtle/normal/strong) as a data attribute, used to dial back blur on dense sections so text stays crisp.
- [ ] A3 (P0) Introduce a real type scale (title/body/caption sizes + line-heights) instead of ad-hoc `text-sm`/`text-lg`, so bigger bento tiles get proportionally bigger type, not just more content.
- [ ] A4 (P1) Add a second accent gradient variant (pale-sky→thistle) for hover/active states, distinct from the base azure-mist/platinum background gradient.
- [ ] A5 (P2) Subtle grain/noise texture overlay on glass cards (very low opacity) to avoid the "flat blur" look common in glassmorphism.
- [ ] A6 (P1) Consistent icon set (e.g. Lucide) replacing emoji (🦊 💬) for a more polished, theme-colored icon language.
- [ ] A7 (P0) Define focus-visible states for every interactive element using the pale-sky glow, currently only inputs have it.
- [ ] A8 (P2) Section-specific accent tints (Pool = pale-sky, In Progress = thistle, Done = azure-mist) applied to that section's card borders, so the active zone is visually distinct at a glance.
- [ ] A9 (P1) Replace default browser `<select>` for format picker with a styled glass dropdown component (native select breaks the visual system on most OSes).
- [ ] A10 (P2) Add a subtle inner-shadow "pressed" state on buttons for true neumorphic tactility on click, not just hover lift.

## B. Bento Grid & Layout Engine

- [ ] B1 (P0) Replace the fixed weight→span lookup table in `weight.ts` with a true treemap-packing algorithm so tiles guarantee full row/column coverage at any idea count (current version can still leave a ragged last row).
- [ ] B2 (P1) Recompute grid columns based on container width via `ResizeObserver` rather than relying solely on `auto-fill` CSS, enabling true "morphing" column counts.
- [ ] B3 (P1) Animate a tile's *content* reveal (title→description→image staggered fade) when it grows from small to large on weight change, not just the container box.
- [ ] B4 (P2) Add a manual "pin size" override per idea (submitter/video-maker can lock a tile large/small regardless of computed weight) for cases the algorithm gets wrong.
- [ ] B5 (P0) Skeleton-shaped placeholder tiles (matching bento proportions) during initial load instead of a blank flash before the grid populates.
- [ ] B6 (P1) Virtualize the grid (e.g. `react-virtual`) once a section regularly holds 100+ ideas, so DOM node count doesn't balloon.
- [ ] B7 (P2) Tile "merge" animation when two small adjacent tiles combine into one bigger tile after a weight recalculation, instead of a hard cut.
- [ ] B8 (P0) Distinct hover affordance per tile size — small tiles show title-only tooltip on hover since text is clipped, big tiles don't need it.
- [ ] B9 (P1) Section-level bento density toggle (compact vs comfortable) stored per-user in `localStorage`, since "dense" was a firm requirement but power users may still want a compact-numbers view occasionally.
- [ ] B10 (P2) Masonry-safe image aspect handling inside large tiles so uploaded images don't distort when a tile's row-span changes.

## C. Background & Ambient Motion

- [ ] C1 (P1) Layered paper-cut SVG mountain silhouettes (as originally planned) behind the glass grid, parallaxing slightly on scroll — currently only the flat wallpaper photo + gradient exist.
- [ ] C2 (P2) Optional React Three Fiber drifting-mist background layer, feature-flagged off on low-power/mobile devices (falls back to the current CSS gradient).
- [ ] C3 (P1) Parallax the wallpaper image itself very subtly on mouse move (desktop only), reinforcing depth without being distracting.
- [ ] C4 (P2) Time-of-day tint on the wallpaper overlay (cooler blue at night, warmer at day) using the visitor's local clock — playful, on-theme with the moon/fox art.
- [ ] C5 (P0) Reduce wallpaper opacity further behind text-heavy areas (modals, forms) specifically, since 50% flat opacity currently applies everywhere and can hurt legibility on long descriptions.
- [ ] C6 (P2) Respect `prefers-reduced-motion` globally — disable tile-breathe, parallax, and spring layout animations for users who've opted out.

## D. Navigation & Board Structure

- [ ] D1 (P0) Make the four sections (Pool / In Progress / Done / Archived) all reachable — Archived currently has no UI entry point at all, soft-deleted ideas are invisible and unrecoverable in practice.
- [ ] D2 (P1) Add an "Archived" tab with a one-click restore action per idea, completing the soft-delete promise from the original spec.
- [ ] D3 (P1) Side-by-side section view on desktop (three bento zones visible at once) instead of tab-switching, matching the original "side-by-side on desktop" design intent.
- [ ] D4 (P2) Sticky mini progress bar showing pool→in-progress→done counts as a visual funnel in the header, so the team can see backlog health at a glance.
- [ ] D5 (P0) Persist the active tab/section in the URL (`?section=pool`) so links can be shared to a specific board view.
- [ ] D6 (P2) Swipe-between-sections gesture on mobile (left/right swipe = Pool/In Progress/Done) instead of only tapping the pill nav.
- [ ] D7 (P1) Collapse the header into a compact bar on scroll-down, expand on scroll-up (mobile), reclaiming vertical space for the dense grid.

## E. Idea Card

- [ ] E1 (P0) Show the format tag's icon/color even on small tiles (currently the pill is dropped for tiny tiles), using a small color dot instead of full pill to save space.
- [ ] E2 (P1) Relative timestamp ("2d ago") on every card, not just in the detail modal.
- [ ] E3 (P0) Visual "has unread comment" indicator (dot) on cards with recent activity since the viewer's last visit (needs a lightweight `localStorage` last-seen timestamp, no auth required).
- [ ] E4 (P1) Status-colored left border accent on each card (subtle, matches section accent from A8) so a card's status is legible even out of context (e.g. search results).
- [ ] E5 (P2) Mini sparkline of view-count growth directly on "Done" cards, pulled from `performance_logs`, so leaders are visible without opening the modal.
- [ ] E6 (P0) Truncate long submitter names / titles with ellipsis + full text on hover, current `line-clamp` can still overflow tile bounds at extreme sizes.
- [ ] E7 (P1) Quick-action icons on hover (comment, archive, move-status) directly on the card, reducing modal-open round trips for common actions.
- [ ] E8 (P2) Confetti/sparkle micro-animation the first time a card crosses into "Done", small reward moment for the video maker.

## F. Idea Detail Modal

- [ ] F1 (P0) Replace `window`-level click-outside-to-close with a proper focus trap + `Escape`-to-close + return-focus-on-close for accessibility and to stop accidental data loss from stray clicks.
- [ ] F2 (P1) Inline-editable title/description (click to edit) instead of requiring a separate edit mode, matching the "anyone can edit" spec more fluidly.
- [ ] F3 (P0) Full-size image lightbox when clicking a thumbnail, current images are tiny 20x20 previews with no zoom.
- [ ] F4 (P1) Comment threading (reply-to-comment) instead of a flat list, useful once discussions get long.
- [ ] F5 (P2) `@name` mention autocomplete in comments, pulled from the distinct list of names seen in the pool so far (still no real accounts, just autocomplete convenience).
- [ ] F6 (P0) Optimistic UI updates for comment/status/archive actions (currently every action re-fetches the whole board before reflecting the change, causing a visible lag).
- [ ] F7 (P1) Edit history / "last edited by X" line, satisfying the "who changed what" transparency goal without real auth.
- [ ] F8 (P2) Convert modal to a shareable deep-link route (`/idea/[id]`) so a specific idea can be linked directly (e.g. in a chat message) and opens the modal on load.
- [ ] F9 (P1) Drag-to-reorder or explicit "move to top of Pool" pin action for prioritizing which idea the video maker should tackle next.
- [ ] F10 (P0) Loading and error states for the Ask-AI box (currently shows nothing on failure besides the raw error string).

## G. Idea Submission Form

- [ ] G1 (P0) Multi-image upload (currently limited to exactly one file) since richer ideas often need several references.
- [ ] G2 (P1) Drag-and-drop image drop zone in addition to the file picker.
- [ ] G3 (P0) Image upload progress indicator and client-side size/type validation before hitting the API.
- [ ] G4 (P1) "Apply AI clarify result" button that replaces the draft description with the AI's tightened summary in one click, instead of just displaying it as read-only text.
- [ ] G5 (P2) Voice-to-text input for the description field (mobile-friendly quick capture when an idea strikes away from a keyboard).
- [ ] G6 (P0) Remember the submitter's name in `localStorage` after first use, pre-filling the name field on future visits/forms.
- [ ] G7 (P1) Inline duplicate-idea warning ("a similar idea titled X already exists") using a simple title-similarity check against existing ideas before submit.
- [ ] G8 (P2) Multi-select format tags instead of single-select, for ideas that genuinely straddle two formats.

## H. Comments

- [ ] H1 (P0) Image attachments in comments (spec'd originally, not yet implemented — currently comments are text-only despite the API/schema supporting `images`).
- [ ] H2 (P1) Comment edit/delete (currently comments are permanent and immutable once posted).
- [ ] H3 (P1) Relative timestamps on comments ("3h ago") instead of no visible time at all.
- [ ] H4 (P2) Emoji-reaction quick-react on comments (👍 🔥) as a lighter-weight alternative to writing a reply.
- [ ] H5 (P0) Auto-scroll to newest comment and auto-focus the comment input when the modal opens, reducing friction for the common "just leave a note" case.
- [ ] H6 (P1) Markdown-lite support in comments (bold/italic/links) rendered safely, useful for pasting reference links.
- [ ] H7 (P2) "Resolve" flag on a comment thread (e.g. a clarifying question that's been answered), so old discussion doesn't look like open questions forever.

## I. Images & Media

- [ ] I1 (P0) Client-side image compression/resizing before upload (currently raw files go straight to Supabase Storage, wallpaper-sized phone photos will be slow and eat free-tier storage fast).
- [ ] I2 (P1) Thumbnail generation (small preview vs full-res original) so bento tiles load fast without pulling full images.
- [ ] I3 (P2) Paste-image-from-clipboard support in both the submission form and comment box.
- [ ] I4 (P1) Alt text / short caption per image for accessibility and for the AI assistant to reference when reasoning about visual context.
- [ ] I5 (P0) Graceful broken-image fallback (placeholder icon) if a Storage URL 404s, instead of a broken `<img>` box.

## J. Performance Tracking & Analytics

- [ ] J1 (P0) Leaderboard view — sort all "Done" ideas by performance metric, the core "successful vs underperforming" feature promised in the original spec but not yet built as a dedicated view.
- [ ] J2 (P1) Per-idea growth chart (views over time from the `performance_logs` timeline) using a lightweight chart lib, visualizing the "days to see how it's performing" data already being collected.
- [ ] J3 (P1) Format-level aggregate stats ("myth-bust videos average 40% more saves than AI-vs-human") to surface which *format*, not just which idea, is working.
- [ ] J4 (P0) Edit/delete on a mis-entered performance log row (currently entries are append-only with no correction path).
- [ ] J5 (P2) CSV export of all performance logs for deeper analysis outside the app.
- [ ] J6 (P1) Configurable "engagement score" formula (weighted combo of views/likes/saves/comments) shown as one sortable number, instead of forcing manual eyeballing of four separate columns.
- [ ] J7 (P2) Automatic "check-in" reminder (visual badge) on Done ideas that haven't had a performance log added in 3+ days since posting.
- [ ] J8 (P0) Validation on performance inputs (no negative numbers, numeric-only) — currently free-text-adjacent number inputs with no guard.
- [ ] J9 (P1) Best/worst performing format badge shown on the leaderboard header (auto-computed, ties into the "log on successful and underperforming ideas" goal directly).
- [ ] J10 (P2) Percentile ranking shown per idea ("top 20% of posted ideas") for quick context on the modal.

## K. AI Assistant Features

- [ ] K1 (P0) Streaming responses for both clarify and ask-AI calls (currently the UI waits for the full response with just a "..." — streaming reads much faster).
- [ ] K2 (P1) "Suggest a format tag" AI action during submission — reads the title/description and recommends one of the five fixed formats.
- [ ] K3 (P1) "Generate hook lines" quick action in the idea modal — AI proposes 2-3 first-3-seconds hook options for that specific idea, tying back to the original hook-bank concept.
- [ ] K4 (P2) "Summarize this week" digest button on the board header (pool-wide summary, the third AI-scope option from earlier discussion, not yet built).
- [ ] K5 (P0) Rate-limit / debounce the Ask-AI and clarify buttons to prevent accidental double-submits burning OpenRouter credits.
- [ ] K6 (P1) Show which model answered (small "via gpt-4o-mini" label) for transparency, and make the model swappable per-call from a small dropdown for cost/quality tradeoffs.
- [ ] K7 (P2) AI-suggested shot list saved back onto the idea as structured data (not just chat text) so the video maker can check off shots.
- [ ] K8 (P0) Graceful handling of OpenRouter failures/timeouts with a retry button, instead of a dead-end error string.
- [ ] K9 (P1) Persist Ask-AI conversation per idea (store Q&A pairs in the DB) so the context isn't lost on modal close/reopen.
- [ ] K10 (P2) "Explain why this tile is this size" tooltip — surfaces the weight-score breakdown (description length, comments, performance) for transparency into the bento algorithm.

## L. Search, Filter & Sort

- [ ] L1 (P0) Text search across title/description, currently there's no way to find an idea except scrolling the grid.
- [ ] L2 (P0) Filter by format tag (chip toggles above the grid).
- [ ] L3 (P1) Filter by submitter name.
- [ ] L4 (P1) Sort control (newest / oldest / most discussed / best performing) independent of the bento weight (weight drives *size*, sort should drive *order*).
- [ ] L5 (P2) Saved filter presets ("my ideas", "needs performance log") as quick-access pills.
- [ ] L6 (P0) Empty-search-result state distinct from the empty-section state, with a "clear filters" action.

## M. Mobile & Touch UX

- [ ] M1 (P0) Larger touch targets on status pills and comment/submit buttons — several buttons currently sit under the ~44px recommended touch minimum.
- [ ] M2 (P1) Bottom-sheet style modal on mobile (slides up from bottom) instead of centered dialog, more natural for one-handed use.
- [ ] M3 (P1) Sticky "+ New idea" floating action button on mobile instead of only in the header, reachable with a thumb.
- [ ] M4 (P0) Test and fix `100dvh` vs `100vh` usage so the layout doesn't jump when mobile browser chrome shows/hides.
- [ ] M5 (P2) Haptic feedback (`navigator.vibrate`) on status change / archive actions on supporting devices, small tactile confirmation.
- [ ] M6 (P1) Pull-to-refresh gesture on the board to manually re-fetch ideas.

## N. Accessibility

- [ ] N1 (P0) ARIA labels on icon-only / emoji-only buttons (comment count, archive) — currently unreadable to screen readers.
- [ ] N2 (P0) Color-contrast audit of taupe-grey text on the lightest glass backgrounds (azure-mist/platinum) — some combinations are likely under WCAG AA at small sizes.
- [ ] N3 (P1) Full keyboard navigation through the bento grid (arrow keys between tiles, Enter to open) not just tab-order.
- [ ] N4 (P1) `aria-live` region announcing async state changes (idea saved, comment posted, AI response ready) for screen reader users.
- [ ] N5 (P2) High-contrast theme toggle as an alternative to the pastel glass palette, for low-vision users.

## O. Feedback, Empty States & Errors

- [ ] O1 (P0) Toast notification system (success/error) for all mutating actions — currently most actions fail silently in the UI if the network call errors.
- [ ] O2 (P0) Distinct, friendlier empty-state copy per section ("Pool" empty vs "Done" empty should say different encouraging things, not the same generic line).
- [ ] O3 (P1) Inline form validation messages (e.g. "title required") instead of the submit button just silently no-op-ing when fields are blank.
- [ ] O4 (P2) Undo toast after archiving an idea ("Archived — Undo") as a faster alternative to digging into the Archived tab.
- [ ] O5 (P0) Global error boundary with a friendly fallback (matching the glass aesthetic) instead of a raw Next.js error screen if something throws.
- [ ] O6 (P1) Connection-lost banner if Supabase/network calls start failing repeatedly, so the team knows to refresh rather than assuming the pool is just empty.

## P. Personalization & Identity

- [ ] P1 (P0) Persistent "device identity" (name + optional color/avatar chosen once, stored in `localStorage`) auto-applied to new ideas/comments instead of retyping a name every time.
- [ ] P2 (P1) Per-submitter color coding (small colored dot matching their chosen identity) on cards/comments, making it easy to visually scan "who submitted what" across the board.
- [ ] P3 (P2) Lightweight "my ideas" quick filter using the stored identity, without building real accounts.
- [ ] P4 (P1) Simple avatar picker (emoji or preset icon set matching the kitsune theme) at first visit, stored alongside the name.

## Q. Power-user & Productivity

- [ ] Q1 (P1) Keyboard shortcut for "new idea" (e.g. `n`) and quick-close modals with `Esc`.
- [ ] Q2 (P2) Bulk actions (select multiple cards, bulk-archive or bulk-move) for board cleanup sessions.
- [ ] Q3 (P1) Command palette (`Cmd+K`) for jump-to-idea search + quick actions, fits a small power-user team well.
- [ ] Q4 (P2) Weekly digest link (or copyable summary text) the team can paste into a group chat, generated from the AI pool-summary feature (K4).

## R. PWA / Performance / Offline

- [ ] R1 (P1) Add a web app manifest + icons so the board can be "Add to Home Screen" on mobile, matching the mobile-first intent.
- [ ] R2 (P2) Basic offline caching (last-loaded board state) via a service worker, so the app isn't a blank page on a spotty connection.
- [ ] R3 (P0) Image lazy-loading (`loading="lazy"`) on all idea/comment thumbnails, currently all images load eagerly regardless of tile visibility.
- [ ] R4 (P1) Route-level code splitting check — confirm Framer Motion / future Three.js background don't bloat the initial JS bundle on first load.
- [ ] R5 (P2) Background revalidation (poll or Supabase Realtime subscription) so the board updates live when a teammate adds an idea, instead of requiring a manual reload.
- [ ] R6 (P0) Debounce/cache repeated `/api/ideas` fetches — currently every modal open/close and status change triggers a full board re-fetch.

---

## Suggested build order

1. **P0 items first**, grouped by whether they're bugs/gaps in the existing spec (D1/D2 archived-tab, H1 comment images, J1 leaderboard — these are promised features not yet built) vs. genuine polish (A/E/N/O items).
2. Then **P1** by category, roughly: Performance tracking (J) and AI (K) next since they're the most differentiated part of the product, followed by mobile/accessibility (M/N) before a wider rollout to the team.
3. **P2** items are genuinely optional — revisit after the team has used the P0/P1 version for a couple of weeks and knows what actually gets missed.

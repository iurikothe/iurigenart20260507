# ArtBlocks reference

A living dossier of the ArtBlocks technical contract — links, constraints,
and lessons we collect as we go.

## Constraints cheat sheet

The non-negotiables for any sketch shipped to ArtBlocks:

- **Determinism.** All randomness must derive from `tokenData.hash` (a 64-char
  hex string). The generator injects `tokenData` at runtime; you don't create
  it. Forbidden: `Math.random()`, `Date.now()`, `setTimeout`, `setInterval`,
  `fetch`, any DOM creation, any external `<script>` tags inside your sketch.
- **One library.** Pick from the registry; we use **p5.js v1.11.11**. The
  generator loads it globally — your script never references it via `<script>`.
- **Resolution-agnostic.** Use relative coordinates and proportional sizing.
  Don't assume any particular canvas size; the rendering environment varies.
- **Animation must be self-contained on first frame.** ArtBlocks captures a
  single thumbnail frame; the piece must look meaningful at every frame.
- **Interactivity is post-render.** Keyboard / mouse handlers are allowed in
  the live viewer but cannot influence the captured thumbnail.
- **Trait extraction.** Set `window.$features = { ... }` synchronously during
  setup, deterministically derived from the hash.
- **Size budget.** Keep the script ≤ ~200KB to avoid heavy on-chain gas.

## Reference URLs

### Docs
- Overview: https://github.com/ArtBlocks/artblocks-docs/blob/main/creator-onboarding/artists/overview.md
- Getting started: https://github.com/ArtBlocks/artblocks-docs/blob/main/creator-onboarding/artists/0-getting-started.md
- Building your project: https://github.com/ArtBlocks/artblocks-docs/blob/main/creator-onboarding/artists/1-building-your-project.md
- Staging & testing: https://github.com/ArtBlocks/artblocks-docs/blob/main/creator-onboarding/artists/2-staging-and-testing.md
- Mainnet launch: https://github.com/ArtBlocks/artblocks-docs/blob/main/creator-onboarding/artists/3-mainnet-launch.md
- FAQ: https://github.com/ArtBlocks/artblocks-docs/blob/main/creator-onboarding/artists/faq.md
- Community: https://github.com/ArtBlocks/artblocks-docs/blob/main/creator-onboarding/artists/community.md
- Minters: https://github.com/ArtBlocks/artblocks-docs/blob/main/creator-onboarding/artists/minters.md
- Docs repo root: https://github.com/ArtBlocks/artblocks-docs

### Tools
- Creator Dashboard (production): https://create.artblocks.io
- Artist staging (testnet): https://artist-staging.artblocks.io
- Starter template repo: https://github.com/ArtBlocks/artblocks-starter-template
- Splits dashboard (royalties): https://app.splits.org

## Learnings log

Append-only — newest at top.

- **2026-05-07** — Project initialized with p5.js v1.11.11, sfc32 PRNG seeded
  from `tokenData.hash`, single-file `sketch.js` and a local `index.html`
  harness that simulates `tokenData` (URL `?hash=0x...` to lock a hash).
- **2026-05-07** — Local harness loads p5.js from **jsDelivr**, not cdnjs.
  cdnjs hasn't republished 1.11.11 yet (their latest 1.11.x is 1.11.10);
  jsDelivr mirrors npm directly. Only matters for local dev — ArtBlocks
  injects p5.js itself in production.
- **2026-05-07** — Node toolchain pinned to asdf via `.tool-versions`. No
  Homebrew Node anywhere in this project.

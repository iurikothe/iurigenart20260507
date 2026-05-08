# CLAUDE.md

Guidance for future Claude sessions working in this repo. Read once, keep in mind.

## What this project is

Generative art experiments aimed at [ArtBlocks](https://artblocks.io), built on
**p5.js v1.11.11**. The repo holds one in-progress sketch at a time (currently a
"drifting seeded particles" starter) plus living docs that capture every
ArtBlocks technical learning. The intent is to mint pieces; the constraints
below are non-negotiable because of that.

## Three rules — every piece must satisfy all three

1. **Responsive** — sized in relative units; works at any screen size.
2. **Animated** — never a still image; `draw()` loops.
3. **Interactive** — at least a few keys shape the live experience.

Interactivity layers on top of the deterministic seed; ArtBlocks captures a
single thumbnail frame, so keys never change what gets minted, only the live
viewing experience.

## Hard ArtBlocks constraints (do not violate)

- **All randomness from `tokenData.hash` only.** Never use `Math.random()`,
  `Date.now()`, `setTimeout`, `setInterval`, `fetch`, or any non-deterministic
  source inside the sketch's deterministic flow. Use the seeded `Random`
  class in `lib/random.js`.
- **Single library only.** p5.js v1.11.11. No second library, no extra
  `<script>` tags inside the sketch.
- **Resolution-agnostic.** No fixed pixel sizes. Compute everything from
  `width`/`height` and `min(width, height)`.
- **`window.$features` is set synchronously in `setup()`**, deterministically
  derived from the hash.
- **Keep the script under ~200 KB** to limit on-chain gas.

Full constraint cheat sheet and source URLs live in `docs/artblocks.md`.

## File map

```
sketch.js          The artwork. Single file uploaded to ArtBlocks.
lib/random.js      sfc32 PRNG seeded from tokenData.hash.
                   Inline this into sketch.js before upload.
index.html         Local-only test harness. NEVER shipped to ArtBlocks.
                   Loads p5.js from jsDelivr, fakes tokenData (URL ?hash=0x...).
.mcp.json          Project-scope ArtBlocks MCP server (HTTP, OAuth on first /mcp).
.tool-versions     asdf — pins Node LTS for any npm/npx use.
docs/00-ideas.md   Concept candidates and open questions.
docs/artblocks.md  ArtBlocks reference: constraints, links, learnings log.
```

## Local dev workflow

```sh
python3 -m http.server 8080
# open http://localhost:8080/
```

- Lock a specific hash for repeatability: `?hash=0x<64-hex>`.
- Without `?hash`, a fresh hash is generated per page load.
- Verifying determinism: same `?hash=` → same `window.$features`. Always check
  this after changing `setup()`.

## Toolchain — read carefully

- **Node/npm via asdf only.** Never Homebrew. Pinned in `.tool-versions`.
  When suggesting `npx ...` commands, assume asdf-managed Node.
- **p5.js loaded from jsDelivr in `index.html`.** cdnjs's latest 1.11.x is
  1.11.10; jsDelivr mirrors npm so it has 1.11.11. Only matters for the local
  harness — ArtBlocks injects p5.js itself in production.

## ArtBlocks MCP

The hosted ArtBlocks MCP server (`https://mcp.artblocks.io/mcp`) is wired in
project scope — provides 21 tools for project discovery, mint eligibility,
transaction building, and script scaffolding across ETH / Arbitrum / Base.
First use prompts OAuth via `/mcp`. Prefer it for any ArtBlocks-specific
data lookup before falling back to docs/web search.

## Working norms in this repo

- The Learnings log in `docs/artblocks.md` is append-only — add a dated entry
  whenever you discover something non-obvious about ArtBlocks behavior, the
  toolchain, or local dev quirks.
- Don't fork the artwork into multiple files prematurely. Single-`sketch.js`
  is the shipping target; helpers live in `lib/` for legibility but get
  inlined before upload.
- Don't add tests — generative art doesn't unit-test cleanly. Visual review
  via the local harness is the test, plus determinism checks (same hash →
  same features).

# iurigenart20260507

Generative art experiments aimed at [ArtBlocks](https://artblocks.io), built
on **p5.js v1.11.11**.

## The three rules

Every piece in this project must:

1. **Be responsive** — work at any screen size.
2. **Move** — never a still image.
3. **Be interactive** — at least a few keys shape the live experience.

ArtBlocks captures a single deterministic thumbnail frame, so interactivity
only changes what a viewer sees while sitting with the piece, never what
gets minted.

## Run locally

```sh
python3 -m http.server 8080
# then open http://localhost:8080/
```

Or, with Node managed by asdf (this repo pins `nodejs` in `.tool-versions` —
run `asdf install` once after cloning):

```sh
npx serve .
```

### Lock a specific hash for repeatability

```
http://localhost:8080/?hash=0xabc123...   # any 64-char hex
```

Without `?hash=`, a fresh hash is generated per page load.

## Starter sketch keys

- `space` — pause / resume animation
- `r` — shake (re-orient drift particles)
- `f` — fullscreen toggle

## Layout

```
sketch.js        the artwork — the file uploaded to ArtBlocks
lib/random.js    sfc32 PRNG seeded from tokenData.hash
index.html       local-only test harness (not shipped to ArtBlocks)
docs/00-ideas.md visual concepts to try
docs/artblocks.md  ArtBlocks links, constraints, and learnings log
```

## Toolchain

- **Node via asdf only** — never Homebrew. Pinned in `.tool-versions`.
- p5.js loaded from cdnjs at v1.11.11 (matches the ArtBlocks dependency registry).

# Reference pieces — study collection

A growing archive of ArtBlocks pieces we want to learn from. One file per piece,
each with the **full on-chain script** verbatim plus our own commentary. Add a
new file under `docs/refs/` whenever there's a piece worth dissecting.

Creator-side rules and constraints live in [`docs/artblocks.md`](../artblocks.md);
this folder is for studying *other people's* code.

## Current refs

| Artist | Title | Token | Project | Library | Local file |
|---|---|---|---|---|---|
| Casey REAS | [Pre-Process](reas-pre-process.md) | `383000057` | 383 | `p5@1.0.0` | `reas-pre-process.md` |
| Kim Asendorf | [Cargo](kim-cargo.md) | `426000167` | 426 | `js@n/a` (none) | `kim-cargo.md` |
| Casey REAS | [923 Empty Rooms](reas-empty-rooms.md) | `1000286` | 1 (BM Engine) | `p5@1.0.0` | `reas-empty-rooms.md` |

## How to add a new ref

1. Pick a piece. Note its `tokenId` and the contract address from the
   `generator.artblocks.io/{chain}/{contract}/{tokenId}` URL.
2. Derive the project ID: `Math.floor(tokenId / 1_000_000)`.
3. Fetch metadata + script (see *Retrieval methods* below).
4. Create `docs/refs/<artist-slug>-<title-slug>.md` using the existing
   files as a template (header table → description → notes → source).
5. Add a row to the table above.
6. Seed the **Notes** section with a couple of first-pass observations
   from skimming the source. Append more as we read deeper.

## Why the generator URL alone is not enough

The page at `https://generator.artblocks.io/{chain}/{contract}/{tokenId}` is
an HTML shell. The artwork's JavaScript, the dependency (e.g. p5.js), and
`tokenData` are assembled **on-chain** by the generator contract (Scripty.sol)
and returned as a single data URI, which the page injects into an iframe.
Plain `view-source:` or `curl` of the URL only returns the shell — the script
is one frame deeper, reconstructed by the browser from the chain. That's why
WebFetch / a simple HTTP GET returns nothing useful.

Reference: <https://github.com/ArtBlocks/on-chain-generator-viewer>

## Retrieval methods

Listed easiest → most powerful. Pick whichever is convenient.

### 1. Public Hasura GraphQL (what we use)

Endpoint: `https://data.artblocks.io/v1/graphql`. Open, no API key required
(at least as of 2026-05-07). Schema includes a `projects_metadata` table with
`script`, `script_type_and_version`, `aspect_ratio`, `description`,
`artist_name`, `name`, `invocations`, `locked`, `complete`, `paused`,
`completed_at`, `website`, etc.

Minimal query (project 383 on the Curated V3 core):

```bash
curl -sS -X POST https://data.artblocks.io/v1/graphql \
  -H 'content-type: application/json' \
  -d '{"query":"{ projects_metadata(where: {contract_address: {_eq: \"0x99a9b7c1116f9ceeb1652de04d5969cce509b069\"}, project_id: {_eq: \"383\"}}) { name artist_name aspect_ratio script_type_and_version script } }"}'
```

Note the `contract_address` is **lower-case** in the GraphQL filter.

Interactive exploration: <https://cloud.hasura.io/public/graphiql?endpoint=https://data.artblocks.io/v1/graphql>

### 2. ArtBlocks MCP (already wired)

The ArtBlocks MCP server (`https://mcp.artblocks.io/mcp`, configured at
project scope in `.mcp.json`) exposes 21 tools. There's no dedicated
"get project script" tool, but the GraphQL ones reach the same Hasura
endpoint:

- `graphql_introspection` / `explore_table` / `validate_fields`
- `build_query` / `graphql_query`
- `get_project` / `get_token_metadata` for high-level metadata + per-token features

Auth: OAuth 2.1, one-time browser sign-in via `/mcp` in Claude Code.
Useful when an agent needs typed schema help; for a one-shot fetch the raw
curl in (1) is cheaper.

### 3. Direct on-chain reads

No HTTP infra at all — read straight from the contract. Each ArtBlocks core
exposes:

```solidity
function projectScriptDetails(uint256 projectId)
  external view returns (
    string scriptTypeAndVersion,
    string aspectRatio,
    uint256 scriptCount
  );

function projectScriptByIndex(uint256 projectId, uint256 index)
  external view returns (string);
```

Get `scriptCount`, then loop indices `0..scriptCount-1` and concatenate.
Method names are stable across V3 / Engine; older V0–V2 contracts have
slightly different signatures.

Etherscan "Read Contract" tabs:

- Curated V3: <https://etherscan.io/address/0x99a9b7c1116f9ceeb1652de04d5969cce509b069#readContract>
- BM Engine:  <https://etherscan.io/address/0x145789247973c5d612bf121e9e4eef84b63eb707#readContract>

### 4. Browser DevTools

Open the generator URL, expand the iframe, copy the inlined `<script>` body.
Fastest one-off, not scriptable.

## Project-ID arithmetic

```
projectId    = floor(tokenId / 1_000_000)
mintNumber   = tokenId % 1_000_000
```

Sanity-checked for our refs:

- `383000057 → 383, mint 57`
- `426000167 → 426, mint 167`
- `1000286   → 1,   mint 286`

## Conventions

- **Notes** sections are append-only, newest-first, dated bullets if useful.
- Keep the **Source** block a verbatim copy of what's on chain. Don't reformat,
  don't trim, don't add comments — those go in **Notes**. We want a faithful
  archive: the bytes here should match what the contract returns.
- For minified single-line scripts (e.g. Cargo), embedding it as-is is fine —
  if we want a beautified copy for study, add it as a separate fenced block
  *below* the verbatim one and label it `// beautified, NOT on-chain`.

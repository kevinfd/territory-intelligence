# Territory Intelligence

A web-based prospect intelligence demo for commercial bankers. Built as a
proof-of-concept to show how a banker's territory, CRM, and new-lead
prospecting could collapse into one polished interface, with transparent
revenue estimates and a tunable priority engine.

This is a demo — no real bank systems, APIs, or auth.

## Quick start

```bash
pnpm install
cp .env.example .env.local   # then paste your Google Maps key
pnpm dev
```

Open http://localhost:3000 and sign in as one of the three demo personas.

## Env vars

| Name | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | yes | Maps JavaScript API key. Restrict by HTTP referrer. |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | no | Optional cloud-styled Map ID. Markers fall back to legacy `google.maps.Marker` if absent. |

## Demo narrative

1. **Sign in** as Colby (LA + OC), Jordan (Inland Empire), or Priya (regional, multi-territory).
2. **Overview** shows KPIs, the masked territory map, and top priorities.
3. **Existing CRM** tab highlights CRM names in-territory and flags refreshed data suggestions.
4. **New Leads** tab shows prospects not yet in CRM, with Tier 1 matches called out.
5. Click any company (on map or in the table) to open the detail drawer — revenue estimate with contributing signals, priority breakdown, executives with pedigree, and a suggested action.
6. **Prioritization logic** (`/settings`) lets you change the target revenue band, include/exclude industries, and tune the seven weights. Every table re-ranks live.
7. **Route brief** picks two SoCal hubs, draws a line, and lists prospects within a configurable buffer. "Save all to watchlist" batches them.

## Architecture (one screen)

```
src/
  lib/
    types.ts                # Company, Banker, Territory, Scored, BusinessLogicConfig
    data/                   # bankers, territories, industries, 150 seeded companies
    scoring/                # revenue estimator, priority scorer, geo helpers
    store.ts                # Zustand (persists banker, config, watchlist to localStorage)
    hooks/use-scored.ts     # single source of Scored[] for the whole app
  app/
    login/                  # persona selector
    dashboard/              # shared layout (topbar + tab nav + global drawer)
      page.tsx              # Overview
      crm/ | new-leads/     # CRM and new-lead specific filters + map dim
      route-brief/          # straight-line route + buffer filter
      watchlist/
    company/[id]/           # full-page company detail (async params, Next 16)
    settings/               # prioritization logic controls
  components/
    territory-map.tsx       # Google Maps + masked overlay + priority dots
    prospect-table.tsx      # sortable table, opens drawer on row click
    company-detail.tsx      # shared by drawer and /company/[id]
    company-drawer.tsx      # shadcn Sheet wrapping CompanyDetail
```

The scoring engine in `src/lib/scoring/` is deterministic and pure. Every
number rendered in the UI also carries a human-readable "why" — that's the
whole pitch.

## Deploying to Vercel

1. Push the repo to GitHub.
2. Import in the Vercel dashboard → framework autodetected.
3. Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (and optional `_MAP_ID`) under Project
   → Settings → Environment Variables.
4. In the Google Cloud Console, add your Vercel preview and production domains
   to the API key's HTTP referrer restrictions.
5. Redeploy.

## Out of scope for this POC

Real bank integrations, real CRM/ZoomInfo/D&B APIs, production auth,
glasses/voice interfaces, email automation. See the PRD for context.

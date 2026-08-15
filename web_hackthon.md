# Scentinel — Autonomous Build Brief (for Google Antigravity)

> **Read this entire document before writing any code.** This is a build brief, not a suggestion list. Where it says "must," treat it as a hard constraint, not a preference.

**Project:** Scentinel — a decentralized lost-dog verification network. Register a dog. If it goes missing, broadcast a spoken alert. Anyone can upload a sighting photo; the system ranks it against active reports with visible reasoning; a confirmed match is permanently logged on Solana devnet.

**Non-negotiable rule #1:** Every integration in this app must call a **real** service — real Gemini API, real ElevenLabs API, real Solana devnet, real database. No hardcoded fake responses, no stubbed "pretend this worked" branches, no mocked match results left in the shipped build. If a real call fails, show a real error state — don't fall back to fabricated data.

---

## 1. Design System — apply exactly, don't reinterpret

This app inherits the **Notion × Duolingo** design system (Notion 55% / Duolingon 45%): a warm document surface for reading/reference screens, tactile Duolingo-style interaction affordances for anything the user presses, submits, or confirms. Copy the tokens below verbatim into the codebase — do not invent new colors, fonts, radii, or shadows anywhere.

### 1.1 Tokens (`frontend/src/styles/tokens.css`)

```css
:root {
  /* document base */
  --bg: #ffffff;
  --bg-alt: #fbfaf8;
  --surface: #f1efea;
  --text: #37352f;
  --text-muted: #6f6b62;
  --text-dim: #a09c92;
  --border: #e9e7e2;
  --border-strong: #d6d3cc;

  /* progress + CTA */
  --accent: #58cc02;
  --accent-hover: #4cad00;
  --accent-deep: #3d8a00;
  --accent-soft: #e8f8d8;

  /* secondary signal colors — re-mapped for Scentinel, see 1.3 */
  --streak: #ff9600;
  --danger: #ff4b4b;
  --xp: #1cb0f6;
}

[data-theme="dark"] {
  --bg: #25241f;
  --surface: #322f29;
  --text: #f1efea;
  --border: #3e3a32;
}
```

### 1.2 Typography

- Font: **Inter** everywhere. No serif, ever — this broke the learning-app parent's context and it'll break this one too.
- h1: Inter Display 700, 40px+. h2–h4: Inter 600/700. Body: Inter 400, 16/26. UI labels/buttons/numerals: Inter 600, never a thin weight on a CTA.
- Scale: 12 / 14 / 16 / 18 / 20 / 24 / 32 / 40 / 56.

### 1.3 Re-mapping the signal colors to this domain

The parent system used `--streak` / `--xp` / `--danger` for a learning app's gamification. Scentinel has no XP or lesson streaks — reuse the same tokens for the *closest semantic equivalent* so the system stays coherent:

| Token | Parent meaning | Scentinel meaning |
|---|---|---|
| `--streak` (orange) | Daily streak count | **Time-missing urgency chip** on a lost alert ("Missing 6 hrs" → orange; escalates visually the longer it's open) |
| `--xp` (blue) | XP earned | **Match confidence badge** on a ranked sighting result ("82% match" pill) |
| `--danger` (red) | Wrong answer | **No active matches found** state, and any real API failure state |
| `--accent` (green) | Progress / primary CTA | Primary actions: Register, Report Lost, Report Sighting, Confirm Match |

### 1.4 Components — build these exactly as specified, reuse everywhere

**Primary Button**
- Radius 16, padding 14/24, weight 700, fill `--accent`, text white.
- Tactile shadow: `0 4px 0 0 var(--accent-deep)`. On press: shadow → `0 0 0 0`, `translateY(2px)`.
- Used for: Register Dog, Report Lost, Report a Sighting, Confirm Match.

**Secondary Button**
- Same geometry, transparent fill, 2px `--border-strong`, text `--text`, weight 700.
- Same tactile press behavior with `--border-strong` shadow.

**Card (document context — e.g., a public alert page)**
- `--bg-alt` fill, 1px `--border`, radius 12. Hover: `--surface` fill, 1px `--border-strong`. **No tactile shadow on cards, ever** — that's reserved for buttons and the match-result tiles below.

**Match Result Tile (interactive context)**
- Treat as an "exercise tile," not a document card: tactile bottom-shadow like buttons, since tapping it is a committing action (opens confirm flow).

**Input**
- 1px `--border`, radius 8, padding 10/14. Focus: 2px `--accent` ring, 2px offset.

**Badge (urgency / confidence)**
- Pill, radius 999, padding 6/12, weight 700, tabular numerals. Urgency = `--streak` fill; confidence = `--xp` fill; both white text.

**Progress/confidence bar** (used inside a match tile to visualize the score)
- Track `--surface`, height 12, radius 999. Fill `--accent` (or `--xp` for match-confidence context), radius 999, inner top highlight `rgba(255,255,255,0.32)` 4px.

### 1.5 Layout zones — assign every screen to exactly one

- **Document zone** (720px centered column, 16px body, 1.6 line-height, flat cards): reading/reference screens.
- **Practice zone** (480px centered card stack on desktop, full-width on mobile, 32px+ inner padding, tactile elements): anything the user is actively doing/submitting.
- App shell: 1180px max width, 240px nav rail (collapses to bottom tab bar at 768px), 8px base spacing scale (8/16/24/32/48/64/96).

### 1.6 Hard reject list (carried over from the parent system — do not violate)

- No serif body text anywhere.
- No tactile shadow on cards (buttons and match tiles only).
- No mascot illustrations of any kind.
- No decorative use of `--streak` / `--xp` / `--danger` outside their assigned signal contexts in 1.3.
- No button/tile radius under 12.
- No thin font weights on CTAs.
- No glass, blur, or soft drop-shadows on cards — modals only get `0 20px 48px rgba(55,53,47,0.18)`.

---

## 2. Screens & User Flows

### 2.1 Screen inventory

| # | Screen | Zone | Purpose |
|---|---|---|---|
| 1 | Home | Document | Explain the concept, CTA to register a dog or report a sighting |
| 2 | Register Dog | Practice | Form: name, photo upload, breed, size, home area (neighborhood-level, not exact address) |
| 3 | Dog Dashboard | Document | Owner's registered dog(s), status, history |
| 4 | Report Lost | Practice | Toggle a dog to "Lost," capture last-seen location/time/notes |
| 5 | Public Lost Alert | Document | Shareable page: photo, description, **audio player** with the ElevenLabs-generated alert, last-seen info |
| 6 | Report a Sighting | Practice | **No login required.** Upload a photo of a stray + location + optional notes |
| 7 | Match Results | Practice | Ranked list of possible matches against active Lost reports, each with a visible reasoning breakdown and confidence badge |
| 8 | Confirm Match | Practice | User confirms a specific match is correct before it's committed to chain |
| 9 | Match Proof | Document | Read-only receipt: match details + the real Solana devnet transaction hash, linked to a live explorer |

### 2.2 Owner flow

```
Home → Register Dog → Dog Dashboard
                          │
                          ▼
                    Report Lost (toggle)
                          │
              Gemini drafts alert text
                          │
              ElevenLabs renders audio
                          │
                          ▼
                 Public Lost Alert (shareable link)
```

### 2.3 Finder flow (anonymous, no account)

```
Home → Report a Sighting (upload photo + location)
              │
    Gemini compares photo against
    all active Lost Alerts
              │
              ▼
        Match Results
    (ranked, with reasoning + confidence badge)
              │
       user selects a match
              │
              ▼
         Confirm Match
              │
   Solana devnet write (hash + timestamp)
              │
              ▼
          Match Proof
   (real tx hash, real explorer link)
```

### 2.4 Empty / error states to design for (not optional)

- No active lost alerts to match against → show a real "no matches yet" state using `--danger`-toned messaging, not a fake match.
- Gemini/ElevenLabs/Solana call fails → real error banner with a retry action. Never silently substitute placeholder content.
- Sighting photo unreadable/low quality → real validation message before submission.

---

## 3. Tech Stack — Vite frontend + separate Node backend

**Frontend:** Vite + React + TypeScript, React Router, Tailwind CSS (config wired to the tokens in §1.1), no UI kit beyond what's specified in §1.4 — build the components, don't pull in a themed component library that fights the design system.

**Backend:** Node.js + Express + TypeScript, as a **separate service** from the frontend (Vite has no API routes — don't try to fake this with Vite middleware in production).

**Database & storage:** Supabase (Postgres + file storage for dog/sighting photos). Real project, real keys, free tier is sufficient for a hackathon build.

**Real external APIs — all called from the backend, never from the browser (keep keys server-side):**
- **Google AI Studio / Gemini API** — structured image comparison (breed/color/pattern/size reasoning) and alert-text drafting.
- **ElevenLabs API** — text-to-speech for the lost alert.
- **Solana web3.js, devnet** — writes a hash + timestamp per confirmed match.

**Deploy:** frontend → Vercel or Netlify (static Vite build). Backend → Railway or Render (small always-on Node service, needed since it holds the real API keys and does the actual work).

---

## 4. Folder Structure — build exactly this layout

```
scentinel/
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx
│   │   ├── router.tsx
│   │   ├── styles/
│   │   │   ├── tokens.css
│   │   │   └── global.css
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── ProgressBar.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   └── AudioPlayer.tsx
│   │   │   ├── dog/
│   │   │   │   ├── DogCard.tsx
│   │   │   │   └── DogForm.tsx
│   │   │   ├── match/
│   │   │   │   ├── MatchTile.tsx
│   │   │   │   └── MatchReasoning.tsx
│   │   │   └── layout/
│   │   │       ├── DocumentShell.tsx
│   │   │       ├── PracticeShell.tsx
│   │   │       └── NavRail.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── RegisterDog.tsx
│   │   │   ├── DogDashboard.tsx
│   │   │   ├── ReportLost.tsx
│   │   │   ├── LostAlertPublic.tsx
│   │   │   ├── ReportSighting.tsx
│   │   │   ├── MatchResults.tsx
│   │   │   ├── ConfirmMatch.tsx
│   │   │   └── MatchProof.tsx
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── dogs.ts
│   │   │   ├── reports.ts
│   │   │   ├── matches.ts
│   │   │   └── chain.ts
│   │   ├── hooks/
│   │   │   └── useDogs.ts
│   │   └── types/
│   │       └── index.ts
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── .env.example
│
├── backend/
│   ├── src/
│   │   ├── index.ts
│   │   ├── routes/
│   │   │   ├── dogs.routes.ts
│   │   │   ├── reports.routes.ts
│   │   │   ├── matches.routes.ts
│   │   │   └── chain.routes.ts
│   │   ├── services/
│   │   │   ├── gemini.service.ts
│   │   │   ├── elevenlabs.service.ts
│   │   │   ├── solana.service.ts
│   │   │   └── supabase.service.ts
│   │   ├── middleware/
│   │   │   ├── errorHandler.ts
│   │   │   └── validateRequest.ts
│   │   ├── config/
│   │   │   └── env.ts
│   │   └── types/
│   │       └── index.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── README.md
└── web_hackthon.md   ← this file, keep at repo root as the build brief
```

---

## 5. API Contract — implement exactly, don't rename or restructure

Base path: `/api`

| Method | Path | Body / Params | Returns |
|---|---|---|---|
| POST | `/dogs` | `{ name, photo, breed, size, homeArea, ownerContact }` | dog record |
| GET | `/dogs/:id` | — | dog record |
| GET | `/dogs?ownerId=` | — | dog list |
| POST | `/dogs/:id/lost` | `{ lastSeenLocation, lastSeenTime, notes }` | calls Gemini → draft text; calls ElevenLabs → audio URL; returns `{ alertId, text, audioUrl }` |
| GET | `/alerts/:id` | — | public alert data for the shareable page |
| POST | `/sightings` | `{ photo, location, notes }` | runs Gemini comparison vs. active alerts → `{ matches: [{ dogId, confidence, reasoning }] }` |
| POST | `/matches/:id/confirm` | — | writes hash+timestamp to Solana devnet → `{ txHash, explorerUrl }` |
| GET | `/matches/:id` | — | match + chain proof for the Match Proof screen |

Every one of these must hit its real backing service. If you can't get a key working, surface a real "integration not configured" error — do not silently stub the route.

---

## 6. Environment Variables

```
# backend/.env
GEMINI_API_KEY=
ELEVENLABS_API_KEY=
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_KEYPAIR_SECRET=
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
PORT=4000

# frontend/.env
VITE_API_BASE_URL=http://localhost:4000/api
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Never commit real values. `.env.example` files ship with empty placeholders only. The backend is the only place that touches `SOLANA_KEYPAIR_SECRET`, `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, and the Supabase **service role** key — the frontend only ever gets the public anon key.

---

## 7. Autonomous Build Order (for Antigravity's Manager view)

Dispatch as parallel missions where genuinely independent, then converge:

1. **Mission A — Backend services first.** `gemini.service.ts`, `elevenlabs.service.ts`, `solana.service.ts`, `supabase.service.ts` — get each one working against the real API in isolation (a throwaway test script per service) before wiring routes. Don't build the routes on top of an unverified service.
2. **Mission B — Frontend shell, in parallel.** Tokens, Tailwind config, the `ui/` and `layout/` components from §1.4, routing skeleton for all 9 screens with placeholder content — this doesn't depend on the backend being done.
3. **Mission C — Database schema in Supabase**, in parallel with A and B: `dogs`, `alerts`, `sightings`, `matches` tables with the fields implied by the API contract in §5.
4. **Converge:** wire the routes (§5) on top of the verified services from Mission A, connect the frontend `api/` layer to the real backend, replace placeholder screen content with live data.
5. **Final QA mission:** drive a real browser through both full flows in §2.2 and §2.3 end to end. Confirm: no console errors, every network call is a real request (check the network tab, not just the UI), the Solana transaction hash is a real, resolvable devnet transaction.

**Security note for this specific tool:** don't let an agent browse untrusted external pages while it has access to `.env` or the keys above — there's a documented prompt-injection risk in agentic IDEs where a hidden instruction on a webpage can trick an agent into exfiltrating credentials. Keep any "research this API" browsing in a mission that has no filesystem access to the `.env` files.

---

## 8. Definition of Done

- [ ] All 9 screens in §2.1 exist and are reachable via the flows in §2.2/§2.3
- [ ] Every API call in §5 hits its real backing service — verified in the network tab, not assumed
- [ ] Design tokens from §1.1–§1.4 applied with zero deviations; nothing on the reject list in §1.6 is present
- [ ] A full owner flow and a full finder flow can be completed live, end to end, with no mocked step
- [ ] The Match Proof screen shows a transaction hash that resolves on a real Solana devnet explorer
- [ ] `.env.example` files exist and committed; real `.env` files are gitignored
- [ ] README documents setup steps for a judge to run it locally with their own keys

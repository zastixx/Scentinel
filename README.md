# Scentinel — Decentralized Lost-Dog Verification Network

Scentinel is a web-based, decentralized lost-dog verification network. It enables dog owners to register their pets, toggle their status to missing, and instantly generate and broadcast localized spoken voice alerts. Strays spotted by the community can be photographed and reported anonymously; our Gemini AI comparison engine compares features against active lost reports with detailed reasoning. Once a match is confirmed, proof of recovery is written permanently to the Solana Devnet blockchain.

## Demo Video

https://www.youtube.com/embed/K2kErdIGdTw?si=OoKzGnp8KR2728mz
---

## Technical Stack & Architecture

- **Frontend**: React (v19) + Vite + TypeScript + Tailwind CSS (v4) + React Router (v6). Adheres to a custom **Notion × Duolingo** hybrid design system.
- **Backend**: Node.js + Express + TypeScript.
- **Database & Storage**: Supabase (PostgreSQL database + storage buckets for images and audio files).
- **Integrations**:
  - **Google Gemini API** (Gemini 2.5 Flash): Visual image comparison and spoken audio script drafting.
  - **ElevenLabs API**: Life-like text-to-speech rendering of lost alerts.
  - **Solana Web3**: Permanent, immutable log of confirmed matches written directly to the Solana Devnet ledger using the Solana Memo program.

---

## Getting Started & Setup

Follow these steps to run Scentinel locally for evaluation.

### 1. Database Setup (Supabase)

1. Create a free project on [Supabase](https://supabase.com/).
2. Navigate to the SQL Editor and execute the schema script located in the root of this project: [`supabase_schema.sql`](file:///c:/Users/KIIT/Desktop/Scentinel/supabase_schema.sql).
3. Navigate to **Storage** in the Supabase dashboard and create three **Public** buckets:
   - `dog-photos`
   - `sighting-photos`
   - `voice-alerts`
4. Set up appropriate storage policies to allow public uploads and reads (or disable RLS/restrictions for local testing).

---

### 2. Backend Configuration

Navigate into the `backend/` directory and configure environment variables.

1. Copy the template:
   ```bash
   cp .env.example .env
   ```
2. Fill in the keys in `backend/.env`:
   - `GEMINI_API_KEY`: Google AI Studio API key.
   - `ELEVENLABS_API_KEY`: ElevenLabs API key.
   - `SUPABASE_URL`: Your Supabase project URL (e.g. `https://xxxx.supabase.co`).
   - `SUPABASE_SERVICE_ROLE_KEY`: Service role secret key (required for backend storage uploads).
   - `SOLANA_RPC_URL`: Set to `https://api.devnet.solana.com`.
   - `SOLANA_KEYPAIR_SECRET`: A JSON array of 64 integers representing your Solana funded account secret key (e.g. `[12,42,122,...]`). If the account balance is 0, the backend will attempt to request an airdrop on startup, but you can also fund it manually.
   - `PORT`: `4000`.

---

### 3. Frontend Configuration

Navigate into the `frontend/` directory and configure client-side variables.

1. Copy the template:
   ```bash
   cp .env.example .env
   ```
2. Fill in the keys in `frontend/.env`:
   - `VITE_API_BASE_URL`: `http://localhost:4000/api`
   - `VITE_SUPABASE_URL`: Your Supabase project URL.
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase public anon key.

---

### 4. Running the Application

Open two terminal sessions to launch the development servers.

#### Start the Backend API Server
```bash
cd backend
npm install
npm run dev
```
The server will start on `http://localhost:4000`.

#### Start the Frontend Web App
```bash
cd frontend
npm install
npm run dev
```
The web app will start on `http://localhost:5173`. Open this URL in your browser.

---

## Standalone Integrations Verification

You can verify that all 4 external integrations (Supabase, Gemini, ElevenLabs, Solana) are correctly configured by running our standalone integration testing scripts in the backend:

```bash
cd backend
# Verify all integrations at once
npm run test:services

# Or verify individual services
npx ts-node src/scripts/test-services.ts supabase
npx ts-node src/scripts/test-services.ts gemini
npx ts-node src/scripts/test-services.ts elevenlabs
npx ts-node src/scripts/test-services.ts solana
```

---

## User Flows

### Owner Flow
1. **Home** $\rightarrow$ Click **Register My Dog** $\rightarrow$ Fill form (e.g., name: Buddy, Breed: Golden Retriever, select dog photo).
2. Under **Dashboard**, view registered dog. Click **Report Lost**.
3. Fill details (last seen place, time, notes) and submit.
4. Gemini drafts the script, and ElevenLabs synthesizes audio. The page redirects to the public shareable alert.
5. Play the lifelike audio voice broadcast and copy the public alert URL.

### Finder Flow (Anonymous)
1. **Home** $\rightarrow$ Click **Report Sighting**.
2. Upload a photo of a stray dog, select location, and submit.
3. Gemini compares features against active database reports.
4. View ranked matches with confidence metrics (e.g. "95% match") and reasoning breakdowns.
5. Click on the matched dog $\rightarrow$ Review comparison details $\rightarrow$ Click **Confirm Match**.
6. The app writes the match metadata to Solana Devnet, updates the database, sets dog status back to safe, and renders a receipt with the real Solana explorer transaction link.

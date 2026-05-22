# Vyral + RTIST

> Dump it. Vyral handles the rest.

Vyral is a mobile-first creative platform for teens — a social app and a private AI life OS in one binary. You post, discover, and connect on the surface. Beneath it, an AI organises your notes, files, writing sessions, and thoughts into adaptive Spaces.

---

## Two surfaces, one app

| Surface | Entry point | What it does |
|---------|-------------|--------------|
| **Social platform** | `app/(tabs)/` | Public feed, challenges, capture, inbox, profile |
| **AI Personal OS** | `App.tsx` | VYRAL · KOI · ROTIST · LEGACY · SETTINGS |

Both surfaces ship together in the same Expo binary. The social tabs are the default experience; the AI OS is accessible from the profile screen and via swipe gestures.

---

## Social Platform

Five tabs driven by live Supabase data.

### Home
- **For You** feed curated from `posts` + `profiles` tables
- **Trending Now** — live hashtag counts with shimmer skeleton loading
- **Daily Challenge** — active challenge with a live countdown timer
- Search bar navigates to Discover on submit; × clear button
- Pull-to-refresh throughout

### Capture
- Cinematic viewfinder with animated corner brackets
- Multi-mode capture: Video, Photo, Text, Voice
- Recording state: record button morphs circle → red square with a live MM:SS timer
- Viewfinder accent color changes to red during recording
- Side controls (Effects, Flip) and bottom controls (Sounds, Speed, Timer, Canvas)

### Discover
- Hashtag browser with post counts
- Challenge gallery — Late Night Edits, 60-second freestyle, Study with me, Raw take
- Functional search `TextInput` with × clear

### Inbox
- Tab filter: All · Mentions · Likes · DMs — all tappable with active styling
- Teen safety: followers-only DMs for users under 18
- Polished empty state when no notifications exist

### Profile
- Public identity: avatar, handle, stats (Posts · Followers · Following)
- **Edit Profile** → `/me` account screen
- **Personalize** → opens the theme customisation sheet
- Private tools section: AI Spaces · Life & Legacy · Account & Safety
- Sign out

---

## AI Personal OS

Accessed from the bottom **V** core button or by swiping between modes. Five modes:

### VYRAL — Life OS
The main workspace. Drop messy text, upload a file (image, PDF, plain text), or type a thought — the Space Maker sends it through the AI pipeline and returns a named Space with:
- Detected patterns and themes
- Extracted tasks with priorities and time estimates
- Suggested next actions
- A generated visual identity
- A Life & Legacy candidate entry

Approve a Space to save it permanently. Swipe or use the rail to move between modes.

### KOI — DIVE reset
A 60-second guided reset. KOI returns a reflection prompt, captures a short reflection, and extracts one clean next action. Sessions are saved to Life & Legacy automatically.

### ROTIST — Writing signal
Handwriting intelligence layer. A ROTIST session analyses:
- **Pressure** — grip intensity over time
- **Fatigue** — sustained effort score
- **Spacing** — tight vs steady letter rhythm

Extracts structured tasks from session content. Features: Ghost Word auto-complete, Spatial Undo, Summary Lift (circle a paragraph → flick up → summary card).

### LEGACY — Memory archive
Every approved Space, KOI reset, and ROTIST session leaves an entry here. Long-form milestones stay private.

### SETTINGS — Control
Privacy and accessibility:
- Reduce motion
- Dyslexia-friendly spacing
- High contrast
- Slow-read pacing

---

## Personalisation

Every major UI surface exposes an accent color that the user can override from **Profile → Personalize**.

The theme system uses a `ThemeProvider` context (`lib/themeContext.tsx`) with a `useAccent(id, fallback)` hook. Overrides persist to `AsyncStorage` under the key `@vyral:theme_v1`.

**Customisable components:**

| ID | Surface |
|----|---------|
| `navAccent` | Tab bar icons and FAB gradient |
| `tabBar` | Tab bar background tint |
| `homeHero` | Home screen logo and category circles |
| `feedCard` | Challenge and feed card accents |
| `captureViewfinder` | Capture screen viewfinder border |
| `captureRecord` | Record button and mode tabs |
| `profileOrb` | Profile avatar ring and gradient |
| `inboxTab` | Inbox active filter tab |
| `discoverTag` | Discover trending tag pills |
| `spaceCard` | AI Space card borders |

All 10 components fall back to the default purple palette if no override is set. Reset individual components or reset everything from the sheet.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Expo 55 + React Native 0.81 |
| Routing | Expo Router 6 (file-based) |
| Animation | React Native Reanimated 4.1 |
| Gestures | React Native Gesture Handler 2.28 |
| Styling | NativeWind 4 + Tailwind CSS 3 |
| Backend | Supabase — PostgreSQL, Auth, RLS, Edge Functions |
| AI | OpenAI GPT-4o-mini via Supabase Edge Functions |
| Motion | Remotion 4 (server-side scene rendering) |
| Web build | Vite 6 + React Router 7 |
| Local storage | AsyncStorage (theme persistence) |
| Language | TypeScript 5.9, strict mode |

---

## Getting Started

### Prerequisites

- Node 20+
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your phone (for quick device testing)
- A Supabase project (free tier works)

### Setup

```bash
git clone https://github.com/garrison238203498/vyral-rtist.git
cd vyral-rtist/vyral-rtist
npm install
cp .env.example .env
# fill in .env with your Supabase values
npm start
```

Scan the QR code with Expo Go, or press `i` for iOS simulator / `a` for Android emulator.

**For physical device testing over a tunnel:**

```bash
npm run start:tunnel
```

---

## Environment Variables

Create `vyral-rtist/.env` from `.env.example`:

| Variable | Where to set | Description |
|----------|-------------|-------------|
| `EXPO_PUBLIC_SUPABASE_URL` | `.env` | Your Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `.env` | Supabase anon / publishable key |
| `EXPO_PUBLIC_VYRAL_API_BASE_URL` | `.env` (optional) | Vercel URL for web AI fallback |
| `OPENAI_API_KEY` | Supabase secret | OpenAI project key — **never expose to client** |
| `OPENAI_MODEL` | Supabase secret | e.g. `gpt-4o-mini` |
| `OPENAI_IMAGE_MODEL` | Supabase secret | e.g. `gpt-image-1` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase secret | Service role key (Edge Functions only) |

The Expo app calls Supabase Edge Functions directly. The `OPENAI_API_KEY` never leaves the server.

---

## Supabase Setup

### Run migrations

```bash
supabase db push
```

Or apply manually:

```sql
-- supabase/migrations/202605100001_ai_intake_memory.sql
-- supabase/migrations/202605140001_openai_ai_api_upgrade.sql
```

### Set Edge Function secrets

```bash
supabase secrets set OPENAI_API_KEY=your_key
supabase secrets set OPENAI_MODEL=gpt-4o-mini
supabase secrets set OPENAI_IMAGE_MODEL=gpt-image-1
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
supabase secrets set SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

### Deploy Edge Functions

```bash
supabase functions deploy intake
supabase functions deploy affinity
supabase functions deploy space-visual
```

| Function | Purpose |
|----------|---------|
| `intake` | Analyses text, images, PDFs → Space candidate + tasks + visual prompt |
| `affinity` | Builds an affinity profile from approved Spaces and navigation patterns |
| `space-visual` | Generates or falls back to a polished Space visual identity |

---

## Project Structure

```
vyral-rtist/
├── app/                        # Expo Router screens
│   ├── (tabs)/                 # Social platform
│   │   ├── home.tsx            # For You feed + trending + challenge
│   │   ├── capture.tsx         # Cinematic viewfinder + recording state
│   │   ├── discover.tsx        # Hashtag browser + challenge gallery
│   │   ├── inbox.tsx           # Notifications (All/Mentions/Likes/DMs)
│   │   ├── profile.tsx         # Public identity + private tools
│   │   └── _layout.tsx         # Tab bar with animated indicator + FAB
│   ├── index.tsx               # Cinematic boot splash (animated NeonV)
│   ├── login.tsx               # Auth gateway (sign in / sign up)
│   ├── koi.tsx                 # KOI game layer landing page
│   ├── spaces/[id].tsx         # Space detail view
│   └── _layout.tsx             # Root layout — providers + auth gate
│
├── App.tsx                     # AI Personal OS (VYRAL/KOI/ROTIST/LEGACY/SETTINGS)
│
├── app-system/                 # AI architecture
│   ├── lib/ai/                 # Space Maker, text sanitizer, image provider
│   ├── lib/onboarding/         # Starter Space generator + onboarding types
│   ├── lib/mock/               # Local fallback generators
│   └── components/             # MotionPreview, loading screens
│
├── components/                 # Shared UI
│   ├── PressableScale.tsx      # Animated pressable (scale + haptic)
│   ├── Shimmer.tsx             # Skeleton loading sweep animation
│   ├── GlassCard.tsx           # Frosted glass card (BlurView)
│   ├── PersonalizeSheet.tsx    # Theme customisation modal
│   ├── NeonButton.tsx          # Primary CTA with gradient + glow
│   ├── AmbientBackground.tsx   # Page-level ambient backdrop
│   └── theme.ts                # Design tokens (colors, radius, shadow)
│
├── lib/                        # Data + context
│   ├── auth.tsx                # Supabase Auth context
│   ├── supabase.ts             # Supabase client
│   ├── themeContext.tsx         # Per-component accent color overrides
│   ├── social.ts               # Feed, hashtag, challenge queries
│   └── database.types.ts       # Generated Supabase TypeScript types
│
├── supabase/
│   ├── functions/              # Edge Functions: intake · affinity · space-visual
│   └── migrations/             # Database schema migrations
│
├── remotion/                   # Motion scenes
│   ├── SpaceBloomScene         # Space generation visual
│   ├── KoiDiveScene            # KOI DIVE animation
│   ├── RotistTraceScene        # ROTIST writing trace
│   └── LegacyMemoryScene       # Life & Legacy memory reveal
│
├── src/                        # Vite web build (secondary surface)
├── app.json                    # Expo config (bundle ID, permissions, plugins)
├── package.json                # Dependencies
├── babel.config.cjs            # Babel — NativeWind + Reanimated
├── metro.config.cjs            # Metro + NativeWind
├── tailwind.config.cjs         # Tailwind + NativeWind
├── vite.config.ts              # Vite web bundler
└── eas.json                    # Expo Application Services build config
```

---

## Scripts

```bash
# Native
npm start                  # Start Expo dev server
npm run start:tunnel       # Start with tunnel (for physical devices)
npm run ios                # Open in iOS simulator
npm run android            # Open in Android emulator

# Web
npm run web:expo           # Expo web via Metro
npm run dev                # Vite dev server
npm run build              # TypeScript check + Vite production build
npm run preview            # Preview Vite build

# Motion
npm run remotion:studio    # Open Remotion Studio (animate scenes)
npm run remotion:still     # Render a single still frame (smoke test)

# Quality
npm run typecheck:expo     # TypeScript check for Expo/native target
npm run lint               # ESLint
```

---

## Architecture Notes

**AI fallback chain** — The Space Maker calls Supabase Edge Functions first. If unavailable, it falls back to `app-system/lib/mock/fallbackGenerators.ts` so the app stays usable offline or before Supabase is wired up.

**Dual TypeScript configs** — `tsconfig.expo.json` targets the Expo/Metro bundler (native + Reanimated worklet types). `tsconfig.app.json` targets Vite/web. `tsconfig.node.json` covers build tooling.

**Styling** — NativeWind lets Tailwind class names work on React Native components. `StyleSheet` is used where dynamic values are needed (LinearGradient colors, shadow colors driven by accent, etc.). Raw hex values are imported from `components/theme.ts`.

**Motion** — `app-system/components/motion/MotionPreview.tsx` renders Expo-safe previews of the four Remotion scenes. The full Remotion scenes run server-side for high-quality video generation.

---

## Bundle Identifiers

| Platform | Identifier |
|----------|------------|
| iOS | `com.vyral.rtist` |
| Android | `com.vyral.rtist` |

---

*© 2026 Vyral + RTIST*

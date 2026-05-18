# Vyral + RTIST

This project now has two runnable surfaces:

- Expo native app: `npm start` or `npm run start:tunnel`
- Vite web app with optional Vercel AI routes: `npm run dev`
- Remotion motion previews: `npm run remotion:studio`

For phone testing, install Expo Go, run `npm run start:tunnel`, then scan the QR code from the terminal or browser DevTools page. The Expo build includes camera capture, haptics, safe-area handling, vector icons, and native gradient UI.

The app now uses Supabase Edge Functions as the primary server-side OpenAI API, so Expo can keep working even when Vercel is pointed at the wrong app:

- `supabase/functions/intake` analyzes messy text, images, PDFs, and text files into a summary, tasks, themes, suggested Space, generated visual prompt, and Life & Legacy candidate.
- `supabase/functions/affinity` builds an honest affinity profile from approved Spaces, themes, recent intakes, and navigation patterns.
- `supabase/functions/space-visual` generates or gracefully falls back to a polished Space visual identity.
- `supabase/migrations/202605100001_ai_intake_memory.sql` adds server-side intake memory tables for user inputs, outputs, themes, and navigation patterns.
- `supabase/migrations/202605140001_openai_ai_api_upgrade.sql` adds generated visual metadata support.

Set these as Supabase Edge Function secrets, never as Expo public values:

```bash
supabase secrets set OPENAI_API_KEY=your_openai_project_key
supabase secrets set OPENAI_MODEL=gpt-4o-mini
supabase secrets set OPENAI_IMAGE_MODEL=gpt-image-1
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
supabase secrets set SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

Then deploy:

```bash
supabase functions deploy intake
supabase functions deploy affinity
supabase functions deploy space-visual
```

For Expo, set only public Supabase identifiers:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

The web app still has optional Vercel server-side OpenAI routes:

- `POST /api/intake` analyzes messy text, images, PDFs, and text files into a summary, tasks, themes, suggested Space, and Life & Legacy candidate.
- `POST /api/affinity` builds an honest affinity profile from approved Spaces, themes, recent intakes, and navigation patterns.

Set these only in Vercel environment variables if you want that fallback:

```bash
OPENAI_API_KEY=your_openai_project_key
OPENAI_MODEL=gpt-4o-mini
```

Never expose the OpenAI key as a `VITE_*` or `EXPO_PUBLIC_*` variable. The browser and Expo app call server routes, and the server routes call OpenAI.

For Expo Vercel fallback, set this public value only if Vercel is connected to the correct app:

```bash
EXPO_PUBLIC_VYRAL_API_BASE_URL=https://your-vercel-app.vercel.app
```

The Expo app calls Supabase first as soon as typed text is submitted, a file is picked, or a camera photo is captured. Vercel is only used after Supabase if the fallback URL is configured.

## Prototype Systems

The Expo prototype now has a local AI product architecture under `app-system/`:

- `app-system/lib/ai/spaceMaker.ts` calls the configured Supabase AI route when available and falls back to an input-aware local generator.
- `app-system/lib/ai/textSanitizer.ts` strips markdown and raw model artifacts before anything reaches the UI.
- `app-system/lib/ai/imageProvider.ts` provides swappable generated visual hooks with polished local placeholders.
- `app-system/lib/onboarding/` turns onboarding choices into starter Spaces.
- `app-system/components/motion/MotionPreview.tsx` provides Expo-safe previews for Space Bloom, KOI DIVE, ROTIST Trace, and Life & Legacy motion.

Remotion scene components live in `remotion/`:

- `SpaceBloomScene`
- `KoiDiveScene`
- `RotistTraceScene`
- `LegacyMemoryScene`

Scene styling lives in `remotion/styles.css`; Remotion scenes should use class names and SVG attributes instead of inline CSS.

Run a still-render smoke test with:

```bash
npm run remotion:still
```

## Original Vite Notes

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

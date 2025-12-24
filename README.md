# Volcano: Virtuoso AI Art Assistant (V2)

## What’s inside
- **Two model modes**: ChatGPT Image Gen 1.5 (descriptive) and Nano Banana Pro (structured).
- **Learning modes**: beginner / intermediate / pro.
- **Glossary** with live **Datamuse** + **ConceptNet** expansions.
- **Style DNA blending**: pick 2–4 styles and apply a blend pack.
- **Color intelligence** powered by **The Color API**.
- **Explain this prompt** mode.
- **Image reference** (free/local) that extracts aspect + basic palette hints.
- **PWA**: installable on iPhone (Safari → Share → Add to Home Screen).

## Run locally
```bash
npm install
npm run dev
```

## Supabase
- Run SQL in `supabase/schema.sql`.
- Set env vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Deploy (GitHub → Vercel)
1. Push this repo to GitHub.
2. Import into Vercel.
3. Add env vars.
4. Deploy.

> Note: This starter includes the Supabase client, but the UI doesn’t yet include Projects/Accounts screens.
> That’s the next layer once you confirm auth and DB are configured.

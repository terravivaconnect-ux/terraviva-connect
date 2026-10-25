# Terraviva Connect

Next.js 14 + Supabase (Auth, Postgres with RLS, Storage, Realtime). Deploy on Vercel.

## Run locally
```
cp .env.example .env.local   # paste your Supabase URL + publishable (anon) key
npm install
npm run dev
```
## Vercel
Import this GitHub repo, then add env vars `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Supabase settings (Auth → URL Configuration)
Set **Site URL** to your Vercel domain and add `https://YOUR-DOMAIN/**` (and `http://localhost:3000/**`) to Redirect URLs, so email verification and password reset links work.

## First admin
Register normally, then in Supabase SQL editor run:
`update public.profiles set role='admin' where username='YOUR_USERNAME';`

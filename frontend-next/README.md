# Nexivo — Next.js Frontend

This is the Next.js (App Router) client for the Nexivo API.

## Environment

Create `.env.local` for development:

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

For production, set the same variable in your hosting provider (e.g., Vercel Project Settings → Environment Variables):

- `NEXT_PUBLIC_API_URL` = your FastAPI base URL (e.g., `https://api.example.com`)

## Auth

- Client stores the JWT in `localStorage` at key `token` after login.
- Protected routes are placed under the `(protected)` route group and use a client-side guard that redirects to `/login` if no token is present.

## Dev

- Start backend (FastAPI) on `127.0.0.1:8000`.
- Start frontend:

```
npm install
npm run dev
```

Navigate to the shown URL (usually http://localhost:3000).

## Build

```
npm run build
npm run start
```

## Gmail OAuth

Backend endpoints are under `/api/gmail/*`.

- Connect flow starts from Dashboard → "Connect Gmail" which opens the `connect_url` returned by API.
- Default redirect is `/api/gmail/callback` on the API server (not the frontend).

In Google Cloud Console → OAuth consent screen and Credentials → your OAuth Client:

- Authorized redirect URI: `https://<api-host>/api/gmail/callback`
- For local dev with API at 127.0.0.1:8000: `http://127.0.0.1:8000/api/gmail/callback`

## Deploy to Vercel

- Framework Preset: Next.js
- Build Command: `npm run build`
- Output: `.next` (default)
- Environment Variables:
  - `NEXT_PUBLIC_API_URL` → `https://<your-api-domain>`

After deploy, verify:

- `/login` works and login stores JWT in localStorage.
- `/dashboard` auto-redirects unauthenticated users to `/login`.
- Gmail "Connect" button redirects to Google and returns to `/api/gmail/callback` on your API domain.

## Staging without a custom domain

You can deploy without buying a domain yet.

Option A — Host backend on a free HTTPS subdomain, host frontend on Vercel:

- Backend: Render/Railway/Fly.io → will give you an HTTPS URL like `https://inbox-detox.onrender.com`.
- Set backend env:
  - `ENVIRONMENT=production`
  - `CORS_ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app`
  - `GOOGLE_REDIRECT_URI=https://inbox-detox.onrender.com/api/gmail/callback`
- Frontend (Vercel env):
  - `NEXT_PUBLIC_API_URL=https://inbox-detox.onrender.com`
- Google Cloud Console:
  - Authorized redirect URIs: `https://inbox-detox.onrender.com/api/gmail/callback`

Option B — Keep backend local, expose with ngrok (temporary HTTPS):

- Start backend locally, then run `ngrok http 8000` → get an URL like `https://abcd1234.ngrok.io`.
- Update backend env (temporarily):
  - `GOOGLE_REDIRECT_URI=https://abcd1234.ngrok.io/api/gmail/callback`
  - Allow CORS for your Vercel app domain: `CORS_ALLOWED_ORIGINS=https://<your-vercel-app>.vercel.app`
- Frontend (Vercel env): `NEXT_PUBLIC_API_URL=https://abcd1234.ngrok.io`
- Google Cloud Console redirect URI: `https://abcd1234.ngrok.io/api/gmail/callback`

When you later purchase domains, just replace these envs with your final API and app domains.

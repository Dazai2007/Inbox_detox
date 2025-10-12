# Inbox Detox — Next.js Frontend

This is the Next.js (App Router) client for the Inbox Detox API.

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

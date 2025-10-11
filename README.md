## Backups & Disaster Recovery

This project ships with simple backup/restore scripts.

### Configuration

Settings in `app/core/config.py` (or via environment):

- `BACKUP_DIR` (default: `backups`)
- `BACKUP_RETENTION` (default: `7`) – number of backups to keep

### Create a backup

Runs for SQLite (file copy) and Postgres (pg_dump required in PATH):

```powershell
C:/Users/Lenovo/AppData/Local/Programs/Python/Python313/python.exe scripts/backup_db.py
```

Backups are created under `backups/` as either `.bak` (SQLite) or `.sql` (Postgres). The script prunes old backups beyond retention.

### Restore from a backup

```powershell
C:/Users/Lenovo/AppData/Local/Programs/Python/Python313/python.exe scripts/restore_db.py <path-to-backup>
```

For Postgres, `psql` is required in PATH.

### Scheduling (Windows Task Scheduler)

Create a daily task at 02:00:

1. Open Task Scheduler → Create Basic Task
2. Trigger: Daily at 02:00
3. Action: Start a program
4. Program/script:
   `C:/Users/Lenovo/AppData/Local/Programs/Python/Python313/python.exe`
5. Add arguments:
   `scripts/backup_db.py`
6. Start in: your repo folder

### Disaster Recovery Playbook

1. Stop the app.
2. Provision a new database (or use a fresh file for SQLite).
3. Restore latest backup using the restore script.
4. Run Alembic migrations to head:

```powershell
C:/Users/Lenovo/AppData/Local/Programs/Python/Python313/python.exe -m alembic upgrade head
```

5. Start the app and run `/health`.
6. Verify admin login and a basic email analyze flow.

### Optional: Human verification (CAPTCHA)

To reduce automated abuse, you can enable Cloudflare Turnstile on Login and/or Register.

Backend (.env):

- `CAPTCHA_ENABLED_LOGIN=true` and/or `CAPTCHA_ENABLED_REGISTER=true`
- `TURNSTILE_SECRET_KEY=<your_secret>`

Frontend (frontend/.env):

- `VITE_TURNSTILE_SITE_KEY=<your_site_key>`

When enabled, the forms render a CAPTCHA widget and the API verifies the token server-side before proceeding.

For production Postgres: also back up env/config secrets; consider WAL archiving and off-site backups.

# Inbox Detox
## Postgres quickstart

1) Start Postgres (Docker):

   - Ensure Docker Desktop is installed, then from repo root:

     - On Windows PowerShell:
       - `docker compose up -d`

2) Configure env:

   - Copy `.env.example` → `.env` and set:
     - `DATABASE_URL=postgresql+psycopg2://inbox:inbox@localhost:5432/inbox_detox`
     - `SECRET_KEY=...`
       - For production, set CORS origins (comma-separated):
          - `CORS_ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com`
     - Optional limits:
       - `RATE_LIMIT_PER_MINUTE=10`
       - `FREE_MONTHLY_ANALYSIS_LIMIT=20`

3) Install deps and run migrations:

   - `pip install -r requirements.txt`
   - `alembic upgrade head`

4) Run the API:

   - `uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`

5) Try it:

   - Open http://127.0.0.1:8000/docs
   - Use /api/auth/register → /api/auth/login → /emails/analyze

## API Documentation

- Swagger UI: http://127.0.0.1:8000/docs
- ReDoc: http://127.0.0.1:8000/redoc
- OpenAPI JSON: http://127.0.0.1:8000/openapi.json

Export OpenAPI schema to openapi.json locally:

- VS Code Task: "Docs: Export OpenAPI JSON"
- Or run: `python scripts/export_openapi.py`

## Frontend ↔ Backend API Integration

This project exposes a RESTful API via FastAPI and consumes it from the React (Vite) frontend using Axios. You can integrate the two in development and production in two main ways.

### Option A: Separate origins (recommended during development)

- Backend runs at http://127.0.0.1:8000
- Frontend dev server runs at http://127.0.0.1:5173

Setup:

1) Backend: start API (with auto reload)
   - `uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload`

2) Frontend: configure Vite dev proxies (already in `frontend/vite.config.ts`):
   - Proxies `/api`, `/emails`, `/auth`, `/google`, `/health` to `http://127.0.0.1:8000`

3) Frontend: start Vite dev server
   - `npm run dev --prefix frontend`

Axios base URL:

- If `VITE_API_URL` is not defined, the Axios client uses relative URLs, so requests will be proxied by Vite to the backend. This is simplest for dev.

### Option B: Single origin (serve built SPA from FastAPI)

Build frontend and let FastAPI serve it from `/` alongside the API under `/api/*` and other routes.

1) Build the frontend
   - `npm run build --prefix frontend`

2) Ensure these settings in `.env` or defaults:
   - `SERVE_FRONTEND=true`
   - `FRONTEND_DIST_DIR=frontend/dist`

3) Start the backend
   - `uvicorn app.main:app --host 127.0.0.1 --port 8000`

4) Open http://127.0.0.1:8000 (SPA) and use the API at `/api/...`

Axios base URL:

- Set `VITE_API_URL=/` in `frontend/.env.local` if you want absolute base path (or leave undefined to use relative paths). When deployed behind the same origin, relative paths work naturally.

### CORS

- In development, CORS is permissive (all origins) for convenience.
- In production, specify allowed origins via `CORS_ALLOWED_ORIGINS` (comma-separated), e.g.:
  - `CORS_ALLOWED_ORIGINS=https://app.example.com`

### Environment variables (frontend)

- `VITE_API_URL` (optional): override Axios base URL. Examples:
  - `VITE_API_URL="http://127.0.0.1:8000"` (separate origins dev or staging)
  - `VITE_API_URL="/"` (single-origin prod with SPA served by FastAPI)

### Google OAuth and Gmail

- OAuth endpoints are mounted under `/google/...` in FastAPI.
- In dev, Vite proxies `/google` to the API, so redirects and callbacks continue to work at different ports.
- Configure these in `.env`:
  - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
  - `GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/google/oauth2/callback`

## Migrating to API-only backend + separate frontend

Target architecture:

- Backend: FastAPI returns JSON only (no templates). OAuth, auth, and business routes under `/api/...` and `/google/...`.
- Frontend: React/Next.js (Tailwind) consumes the API; can be deployed independently (e.g., Vercel).

Steps:

1) Backend API-only mode
   - Static/templates serving removed from `app/main.py`.
   - Root `/` returns a simple JSON greeting.
   - CORS uses explicit origins. In dev, `dev_cors_allowed_origins` (see `app/core/config.py`) allows `5173` and `3000` ports.

2) Frontend as separate app
   - Use Vite React (present in this repo) or Next.js in another repo.
   - Configure `VITE_API_URL` (or Next `NEXT_PUBLIC_API_URL`) to point to the API.
   - In dev, use Vite proxy (configured) or Next.js rewrites to `http://127.0.0.1:8000`.

3) Auth flow
   - POST `/api/auth/login` → store `access_token` (localStorage or cookie).
   - Send `Authorization: Bearer <token>` for authenticated calls.
   - Refresh via `/api/auth/refresh-token` (cookie or body).

4) CORS
   - Dev: uses `dev_cors_allowed_origins` list.
   - Prod: set `CORS_ALLOWED_ORIGINS=https://app.example.com`.

5) Deployment
   - Backend: Render/Railway/Fly.io; DB: Supabase/Postgres.
   - Frontend: Vercel/Netlify. Point DNS (Porkbun/Namecheap) to frontend; configure API URL.



## Migrations (Alembic)

This project uses Alembic for database schema migrations (no Flask extensions required).

Quick usage (PowerShell):

- Set DB URL (Postgres example):
   - `$env:DATABASE_URL = "postgresql+psycopg2://inbox:inbox@localhost:5432/inbox_detox"`
- Autogenerate a migration:
   - `python -m alembic revision --autogenerate -m "your message"`
- Apply migrations:
   - `python -m alembic upgrade head`
- See current revision:
   - `python -m alembic current`

See `scripts/migrations_readme.md` for details. In dev with SQLite, tables can also be created at app startup, but production should rely on Alembic.

Optional auto-migrate on startup:

- Set before starting the app to apply migrations automatically:
   - `$env:AUTO_MIGRATE_ON_STARTUP = "true"`
   - Optionally set a specific Python executable:
      - `$env:PYTHON_EXECUTABLE = "${PWD}\\venv\\Scripts\\python.exe"`
   - In production, startup fails if migrations cannot be applied.

## CORS configuration

In development, all origins are allowed for convenience. In production, the API only allows the origins you specify via `CORS_ALLOWED_ORIGINS` (comma-separated). If you leave it empty in production, no origins will be allowed.

Examples:

- Allow a single frontend app:
   - `CORS_ALLOWED_ORIGINS=https://app.example.com`
- Allow multiple subdomains:
   - `CORS_ALLOWED_ORIGINS=https://app.example.com,https://admin.example.com`

   ## Startup configuration validation

   On startup, the app validates critical environment variables and configuration:

   - ENVIRONMENT must be one of: development, staging, production
   - SECRET_KEY must be set and strong (>= 32 chars) in production
   - In production: CORS_ALLOWED_ORIGINS must be non-empty
   - In production: DATABASE_URL must not be SQLite
   - COOKIE_SAMESITE must be one of lax, strict, none (note: none requires Secure cookies and HTTPS)

   Errors cause startup to fail in production; in development, errors are logged and the app continues to aid local debugging.

# Inbox Detox - AI-Powered Email Management SaaS

## Overview
Inbox Detox is a modern SaaS application that helps users manage email overload using AI-powered summarization and categorization.

## Features
- **AI Email Analysis**: Automatically summarize and categorize emails
- **User Authentication**: Secure login and registration system
- **Multiple Categories**: Important, Invoice, Meeting, Spam, Newsletter, Social, Promotion, Other
- **Confidence Scoring**: AI confidence levels for categorizations
- **Responsive UI**: Bootstrap-based frontend with modern design
- **RESTful API**: Well-structured API endpoints
- **Database Integration**: User data and email history storage

## Tech Stack
- **Backend**: FastAPI (Python)
- **Database**: SQLAlchemy with SQLite/PostgreSQL support
- **AI**: OpenAI GPT-3.5-turbo
- **Authentication**: JWT tokens with bcrypt hashing
- **Frontend**: HTML/CSS/JavaScript with Bootstrap 5
- **Deployment**: Ready for Render/Railway deployment

## Quick Start

### Prerequisites
- Python 3.8+
- OpenAI API key

### Installation
1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key
   ```

5. Run the application:
   ```bash
   python run.py
   ```

6. Open http://127.0.0.1:8000 in your browser

## API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login  
- `GET /auth/me` - Get current user info

### Email Analysis
- `POST /emails/analyze` - Analyze email (authenticated)
- `POST /emails/demo-analyze` - Demo analysis (no auth required)
- `GET /emails/` - Get user's analyzed emails
- `GET /emails/{id}` - Get specific email
- `DELETE /emails/{id}` - Delete email

### System
- `GET /health` - Health check
- `GET /api/info` - API information

## Project Structure
```
inbox-detox/
├── app/
│   ├── api/              # API route handlers
│   ├── core/             # Core configuration
│   ├── database/         # Database setup
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   └── main.py           # FastAPI application
├── static/               # Static files (CSS, JS)
├── templates/            # HTML templates
├── tests/                # Test files
├── requirements.txt      # Python dependencies
├── run.py               # Development server
└── README.md            # This file
```

## Development Roadmap

### Phase 1: MVP ✅
- [x] Basic email analysis
- [x] User authentication
- [x] Simple web interface
- [x] Database integration
- [x] AI categorization

### Phase 2: Enhanced Features
- [ ] Stripe subscription integration
- [ ] Email usage limits per tier
- [ ] Advanced analytics dashboard
- [ ] Bulk email processing
- [ ] Export functionality

### Phase 3: Integrations
- [ ] Gmail API integration
- [ ] Outlook API integration
- [ ] Browser extension
- [ ] Mobile app (React Native)

### Phase 4: Scale & Deploy
- [ ] Production deployment (Render/Railway)
- [ ] Custom domain setup
- [ ] Performance optimization
- [ ] Monitoring and logging
- [ ] Auto-scaling configuration

## Configuration

### Environment Variables
- `DATABASE_URL`: Database connection string
- `SECRET_KEY`: JWT secret key
- `OPENAI_API_KEY`: OpenAI API key
- `STRIPE_SECRET_KEY`: Stripe secret key (optional)
- `ENVIRONMENT`: deployment environment

### Database
The application supports both SQLite (development) and PostgreSQL (production). Models are automatically created on startup.

## Deployment

### Render.com
1. Connect your GitHub repository
2. Set environment variables
3. Deploy with automatic builds

### Railway
1. Connect repository
2. Configure environment variables  
3. Deploy with one-click

## Security Features
- Password hashing with bcrypt
- JWT token authentication
- CORS protection
- Input validation with Pydantic
- SQL injection prevention with SQLAlchemy

## Performance Considerations
- Database connection pooling
- API rate limiting (planned)
- Async/await pattern usage
- Efficient database queries
- Caching strategy (planned)

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License
MIT License - see LICENSE file for details

## Support
For support, email: support@inboxdetox.ai (coming soon)

## Changelog
- v1.0.0: Initial MVP release with core features
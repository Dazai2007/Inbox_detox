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
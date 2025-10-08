"""
Legacy entrypoint kept for backward-compatibility.
Delegates to the real FastAPI app in app.main without exposing secrets.
"""

from app.main import app  # noqa: F401

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

import os
import pytest
from fastapi.testclient import TestClient

# Ensure test env uses SQLite temp database (force override) and dev-safe flags
os.environ["DATABASE_URL"] = "sqlite:///./test_db.sqlite3"
os.environ["ENVIRONMENT"] = "development"
os.environ["ALLOW_UNVERIFIED_LOGIN"] = "true"
os.environ["CAPTCHA_ENABLED_LOGIN"] = "false"
os.environ["CAPTCHA_ENABLED_REGISTER"] = "false"

from app.main import app  # noqa: E402
from app.database.database import Base, engine  # noqa: E402

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    # Fresh DB for tests
    if os.path.exists("test_db.sqlite3"):
        try:
            os.remove("test_db.sqlite3")
        except Exception:
            pass
    Base.metadata.create_all(bind=engine)
    yield
    # Teardown
    try:
        os.remove("test_db.sqlite3")
    except Exception:
        pass

@pytest.fixture()
def client():
    return TestClient(app)

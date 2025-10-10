from app.core.config import settings

def test_register_and_login_flow(client):
    # Register
    payload = {
        "email": "user@example.com",
        "password": "StrongP@ssw0rd",
        "full_name": "Test User",
        "timezone": "UTC",
    }
    r = client.post("/api/auth/register", json=payload)
    assert r.status_code == 200
    user = r.json()
    assert user["email"] == payload["email"]

    # Mark user verified directly (bypass email flow for test)
    from app.database.database import SessionLocal
    from app.models.models import User
    db = SessionLocal()
    u = db.query(User).filter(User.email == payload["email"]).first()
    u.is_verified = True
    db.add(u)
    db.commit()

    # Login
    r = client.post(
        "/api/auth/login",
        data={"username": payload["email"], "password": payload["password"]},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    assert r.status_code == 200
    body = r.json()
    assert body["token_type"] == "bearer"
    assert "access_token" in body

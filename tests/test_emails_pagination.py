from app.core.config import settings

def auth_headers(client, email="p1@example.com"):
    # Register and verify
    client.post("/api/auth/register", json={
        "email": email,
        "password": "StrongP@ssw0rd",
        "timezone": "UTC",
    })
    from app.database.database import SessionLocal
    from app.models.models import User
    db = SessionLocal()
    u = db.query(User).filter(User.email == email).first()
    u.is_verified = True
    db.add(u)
    db.commit()
    # Login
    r = client.post(
        "/api/auth/login",
        data={"username": email, "password": "StrongP@ssw0rd"},
        headers={"content-type": "application/x-www-form-urlencoded"},
    )
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_paginated_emails_empty(client):
    h = auth_headers(client)
    r = client.get("/emails", headers=h)
    assert r.status_code == 200
    body = r.json()
    assert body["success"] is True
    assert body["pagination"]["page"] == 1
    assert body["data"] == []

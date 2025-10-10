def test_user_usage_endpoints(client):
    # Register + verify + login
    email = "ua@example.com"
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
    h = {"Authorization": f"Bearer {token}"}

    # Call analytics endpoints
    s = client.get("/analytics/usage/summary", headers=h)
    assert s.status_code == 200
    d = client.get("/analytics/usage/daily", headers=h)
    assert d.status_code == 200

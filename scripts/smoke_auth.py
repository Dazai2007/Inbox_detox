import os
import requests

BASE = os.environ.get("BASE_URL", "http://127.0.0.1:8000")
EMAIL = os.environ.get("SMOKE_EMAIL", "smoke_user@example.com")
PASSWORD = os.environ.get("SMOKE_PASSWORD", "P@ssw0rd!")
NAME = os.environ.get("SMOKE_NAME", "Smoke User")

print(f"Using BASE={BASE}")

# Register
r = requests.post(f"{BASE}/api/auth/register", json={
    "email": EMAIL,
    "password": PASSWORD,
    "full_name": NAME,
})
print("REGISTER:", r.status_code, r.text)

# Login (form)
r = requests.post(f"{BASE}/api/auth/login", data={
    "username": EMAIL,
    "password": PASSWORD,
})
print("LOGIN:", r.status_code, r.text)

data = r.json() if r.headers.get('content-type','').startswith('application/json') else {}
access = data.get('access_token')
refresh = data.get('refresh_token')

# Me
if access:
    h = {"Authorization": f"Bearer {access}"}
    r = requests.get(f"{BASE}/api/auth/me", headers=h)
    print("ME:", r.status_code, r.text)
else:
    print("No access token, skipping /me")

# Refresh
if refresh:
    r = requests.post(f"{BASE}/api/auth/refresh-token", json={"refresh_token": refresh})
    print("REFRESH:", r.status_code, r.text)
else:
    print("No refresh token, skipping refresh-token")

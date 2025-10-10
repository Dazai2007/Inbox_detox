def test_rate_limit_headers_present_on_429(client, monkeypatch):
    # Force very low rate limit for test by monkeypatching app limiter default limit
    from app.main import app
    lim = app.state.limiter
    # Create a simple endpoint with low limit
    from fastapi import APIRouter
    from slowapi.util import get_remote_address
    from fastapi import Request

    router = APIRouter()

    from fastapi.responses import JSONResponse
    @router.get("/rl-test")
    @lim.limit("1/minute", key_func=get_remote_address)
    def rl_test(request: Request):
        return JSONResponse({"ok": True})

    app.include_router(router)

    # First call OK
    r1 = client.get("/rl-test")
    assert r1.status_code == 200

    # Second call should 429 with headers
    r2 = client.get("/rl-test")
    assert r2.status_code == 429
    # Headers injected by slowapi
    assert "X-RateLimit-Limit" in r2.headers
    assert "X-RateLimit-Remaining" in r2.headers
    assert "X-RateLimit-Reset" in r2.headers
    assert "Retry-After" in r2.headers
    body = r2.json()
    assert body["error"]["code"] == 429

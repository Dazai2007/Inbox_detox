import json
from fastapi.testclient import TestClient

from app.main import app


def main():
    client = TestClient(app)
    # Fetch the OpenAPI schema
    resp = client.get(app.openapi_url or "/openapi.json")
    resp.raise_for_status()
    schema = resp.json()
    with open("openapi.json", "w", encoding="utf-8") as f:
        json.dump(schema, f, ensure_ascii=False, indent=2)
    print("Wrote openapi.json")


if __name__ == "__main__":
    main()

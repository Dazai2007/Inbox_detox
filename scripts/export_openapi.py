import sys
from pathlib import Path

# Ensure project root on sys.path
ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.main import app

def main() -> None:
    schema = app.openapi()
    out = ROOT / "openapi.json"
    out.write_text(__import__("json").dumps(schema, indent=2), encoding="utf-8")
    print(f"Wrote OpenAPI schema to {out}")

if __name__ == "__main__":
    main()
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

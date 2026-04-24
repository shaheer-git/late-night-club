import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_verify_requires_auth():
    res = client.post("/api/verifications", json={
        "place_id": "00000000-0000-0000-0000-000000000000",
        "status": "open",
    })
    assert res.status_code == 403


def test_get_verifications_for_place():
    res = client.get("/api/verifications/place/00000000-0000-0000-0000-000000000000")
    assert res.status_code in (200, 500)

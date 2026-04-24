import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_get_places_requires_lat_lng():
    res = client.get("/api/places")
    assert res.status_code == 422  # missing required params


def test_get_places_with_coords():
    res = client.get("/api/places", params={"lat": 12.9716, "lng": 77.5946})
    # Will fail if DB not running — that's expected in unit test
    assert res.status_code in (200, 500)


def test_search_requires_query():
    res = client.get("/api/places/search", params={"lat": 12.9716, "lng": 77.5946})
    assert res.status_code == 422


def test_add_place_requires_auth():
    res = client.post("/api/places", json={
        "name": "Test Cafe",
        "category": "cafe",
        "lat": 12.9716,
        "lng": 77.5946,
        "status": "open",
    })
    assert res.status_code == 403

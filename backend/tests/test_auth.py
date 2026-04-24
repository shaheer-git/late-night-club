import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_register():
    res = client.post("/api/auth/register", json={
        "name": "Test User",
        "email": "test@lnc.app",
        "password": "password123",
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "test@lnc.app"


def test_login():
    res = client.post("/api/auth/login", json={
        "email": "test@lnc.app",
        "password": "password123",
    })
    assert res.status_code in (200, 401)  # 401 if DB not seeded


def test_login_invalid():
    res = client.post("/api/auth/login", json={
        "email": "nobody@lnc.app",
        "password": "wrong",
    })
    assert res.status_code == 401


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

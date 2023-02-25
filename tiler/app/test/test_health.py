from fastapi.testclient import TestClient
from ..main import app

client = TestClient(app)


def test_health():
    """Should throw a Unauthorized Exception if no token has been provided"""
    response = client.get("/cog/info")
    assert response.status_code == 400
    assert response.text == 'No token found'

import pytest
from unittest.mock import patch, Mock
from starlette.testclient import TestClient

from ..main import app

test_client = TestClient(app)


@patch('app.middlewares.auth_middleware.requests.get')
def test_auth(mock_get):
    mock = Mock()
    mock.status_code = 100
    mock_get.return_value = mock
    response = test_client.get("/cog/info", headers={"Authorization": "Bearer my_token"})
    assert response.status_code != 400

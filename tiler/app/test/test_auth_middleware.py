import pytest
from unittest.mock import patch, Mock
from starlette.testclient import TestClient

from ..main import app

test_client = TestClient(app)

@pytest.mark.auth_middleware_test('Tests for Tiler Authentication Middleware')
@patch('app.middlewares.auth_middleware.requests.get')
def test_auth(mock_get):
    mock_get.return_value = {"status_code": 100}
    response = test_client.get("/cog/info", headers={"Authorization": "Bearer my_token"})
    print(response)





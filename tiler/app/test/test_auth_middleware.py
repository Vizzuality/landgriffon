import os

import pytest
from unittest.mock import patch, Mock
from starlette.testclient import TestClient

from ..main import app
from ..middlewares.url_injector import s3_presigned_access

test_client = TestClient(app)

def override_s3_pressigned_access(url: str | None):
    return url

# Inject a mock dependency
app.dependency_overrides[s3_presigned_access] = override_s3_pressigned_access


@patch('app.middlewares.auth_middleware.requests.get')
def test_auth_failing_api_validation(mock_get):
    mock = Mock()
    mock.status_code = 401
    mock_get.return_value = mock
    response = test_client.get("/cog/info", headers={"Authorization": "Bearer my_token"})
    assert response.status_code == 401

@patch('app.middlewares.auth_middleware.requests.get')
def test_auth_correct_api_validation(mock_get):
    mock = Mock()
    mock.status_code = 200
    mock_get.return_value = mock
    response = test_client.get("/cog/info", headers={"Authorization": "Bearer my_token"})
    assert response.status_code != 401


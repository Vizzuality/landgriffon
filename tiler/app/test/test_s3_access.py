import os
from unittest.mock import patch, Mock

import pytest

from app.middlewares.s3_access import s3_presigned_access



def test_s3_access_no_default_cog():

    try:
        s3_presigned_access(url=None)
    except Exception as ex:
        assert ex.__class__.__name__ == 'ValueError'
        assert str(ex) == 'DEFAULT_COG env var is not set. It is required if no URL is passed to the tiler'


@patch('app.middlewares.s3_access.s3.generate_presigned_url')
@patch('app.middlewares.s3_access.default_cog', return_value="fake_tiff.tif", autospec=True )
def test_s3_access_with_default_cog(mock_generate_url, mock_settings):
    mock_generate_url.return_value = 'fake_signed_url'
    try:
        result = s3_presigned_access(url=None)
    except Exception as ex:
        pytest.fail(f"Exception {ex} thrown when expecting none")
    assert result is not None






from botocore.config import Config
from fastapi.params import Query
import boto3
from ..config.config import get_settings

s3 = boto3.client("s3", region_name="eu-west-3", config=Config(signature_version='s3v4'))
bucket_name = get_settings().s3_bucket_name
default_cog = get_settings().default_cog
DATA_PATH_IN_S3 = 'processed/satelligence/'


# # TODO: This only allows to access data hosted on owr s3 bucket. At some point we will need to discriminate
#         external resources i.e datasets that are publicly available

def s3_presigned_access(url: str | None = Query(default=None, description="Optional dataset URL")) -> str:
    """
        Generate a pre-signed URL for an Amazon S3 object.

        Args:
            url (str | None, optional): The URL of the S3 object to generate a pre-signed URL for. If not provided, a default URL is used. Defaults to None.

        Returns:
            str: A pre-signed URL that can be used to access the S3 object.

        Raises:
            botocore.exceptions.NoCredentialsError: If AWS credentials are not found.

        Note:
            This function requires the `boto3` library to be installed, and valid AWS credentials to be configured.

    """
    if not url:
        if not default_cog:
            raise ValueError("DEFAULT_COG env var is not set. It is required if no URL is passed to the tiler")
        url = default_cog
    presigned_url = s3.generate_presigned_url(
        'get_object',
        Params={
            'Bucket': bucket_name,
            'Key': DATA_PATH_IN_S3 + url
        },
        ExpiresIn=3600
    )
    return presigned_url




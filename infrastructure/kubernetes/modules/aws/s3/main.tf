data "aws_caller_identity" "current" {}

resource "aws_s3_bucket" "instance_bucket" {
  bucket = "landgriffon-${var.bucket_name}-bucket"

  tags = {
    Environment = var.bucket_name
  }
}

resource "aws_s3_bucket_versioning" "versioning" {
  bucket = aws_s3_bucket.instance_bucket.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "encryption" {
  bucket = aws_s3_bucket.instance_bucket.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "block_public_access" {
  bucket = aws_s3_bucket.instance_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = aws_s3_bucket.instance_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowAccessToRole"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/eks-node-group-admin"
        }
        Action = "s3:*"
        Resource = [
          "arn:aws:s3:::${aws_s3_bucket.instance_bucket.id}",
          "arn:aws:s3:::${aws_s3_bucket.instance_bucket.id}/*"
        ]
      }
    ]
  })
}


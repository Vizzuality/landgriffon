resource "aws_s3_bucket" "landgriffon-raw-data" {
  bucket = var.bucket
}

resource "aws_s3_bucket_acl" "landgriffon-raw-data_acl" {
  bucket = aws_s3_bucket.landgriffon-raw-data.id
  acl    = "private"
}

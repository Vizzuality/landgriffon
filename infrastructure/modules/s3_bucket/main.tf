resource "aws_s3_bucket" "landgriffon-raw-data" {
  bucket = var.bucket
  acl    = "public-read"
}

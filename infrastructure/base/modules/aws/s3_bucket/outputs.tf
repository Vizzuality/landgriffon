output "bucket_arn" {
  value = aws_s3_bucket.landgriffon-raw-data.arn
}


output "science_bucket_name" {
  value = aws_s3_bucket.landgriffon-raw-data.bucket
}

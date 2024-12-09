output "instance-bucket-arn" {
  value = aws_s3_bucket.instance_bucket.arn
}

output "instance-bucket-name" {
  value = aws_s3_bucket.instance_bucket.bucket
}

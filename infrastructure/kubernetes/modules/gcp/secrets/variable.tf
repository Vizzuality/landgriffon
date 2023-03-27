variable "namespace" {
  type        = string
  description = "The k8s namespace to use"
}

variable "tf_state_bucket" {
  type        = string
  description = "The name of the S3 bucket where the state is stored"
}

variable "gmaps_api_key" {
  type        = string
  sensitive   = true
  description = "The Google Maps API key used for access to the geocoding API"
}

variable "region" {
  type        = string
  description = "GCP region"
}

variable "aws_access_key_id" {
  type        = string
  description = "AWS access key id to read data from the science S3 bucket"
  sensitive   = true
}

variable "aws_secret_access_key" {
  type        = string
  description = "AWS secret access key to read data from the science S3 bucket"
  sensitive   = true
}

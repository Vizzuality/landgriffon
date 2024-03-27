variable "allowed_account_id" {
  type        = string
  description = "Allowed AWS Account ID"
}

variable "namespace" {
  type        = string
  description = "The k8s namespace to use"
}

variable "aws_region" {
  type        = string
  description = "The name of the AWS region where the cluster lives"
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

variable "sendgrid_api_key" {
  type        = string
  sensitive   = true
  description = "The SendGrid API key used for sending emails"
}

variable "eudr_credentials" {
  type        = string
  sensitive   = true
  description = "Service Account credentials to access EUDR Data"
}

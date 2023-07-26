variable "project_name" {
  default     = "landgriffon"
  type        = string
  description = "A project namespace for the infrastructure."
}

variable "environment" {
  type        = string
  description = "An environment namespace for the infrastructure."
}

variable "domain" {
  type        = string
  description = "The base domain name"
}

variable "aws_region" {
  default     = "eu-west-3"
  type        = string
  description = "A valid AWS region to configure the underlying AWS SDK."
}

variable "gcp_region" {
  type        = string
  description = "A valid GCP region to configure the underlying GCP SDK."
}

variable "gcp_project_id" {
  type        = string
  description = "A valid GCP project id to configure the underlying GCP SDK."
}

variable "gcp_zone" {
  description = "A valid GCP zone to configure the underlying GCP SDK."
  type        = string
}

variable "tf_state_bucket" {
  type        = string
  description = "The name of the S3 bucket where the state is stored"
}

variable "allowed_account_id" {
  type        = string
  description = "Allowed AWS Account ID"
}

variable "gmaps_api_key" {
  type        = string
  sensitive   = true
  description = "The Google Maps API key used for access to the geocoding API"
}

variable "sendgrid_api_key" {
  type        = string
  sensitive   = true
  description = "The Sendgrid API key used for sending emails"
}

variable "repo_name" {
  type        = string
  description = "Name of the github repo where the project is hosted"
}

variable "mapbox_api_token" {
  type        = string
  description = "Token to access the Mapbox API"
}

variable "aws_environments" {
  description = "A list of AWS environments"
}

variable "gcp_environments" {
  description = "A list of GCP environments"
}

variable "vpc_cni_addon_version" {
  type        = string
  description = "Version of AWS VPC CNI addon to use"
}

variable "kube_proxy_addon_version" {
  type        = string
  description = "Version of AWS Kube proxy addon to use"
}

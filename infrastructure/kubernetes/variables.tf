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

variable "repo_name" {
  type        = string
  description = "Name of the github repo where the project is hosted"
}

variable "mapbox_api_token" {
  type        = string
  description = "Token to access the Mapbox API"
}

variable "environments" {
  description = "A list of environments"
}

variable "load_fresh_data_staging" {
  type        = bool
  default     = false
  description = "If a new data import should be triggered for the staging app. Clears the current database."
}

variable "load_fresh_data_prod" {
  type        = bool
  default     = false
  description = "If a new data import should be triggered for the production app. Clears the current database."
}

variable "data_import_arguments_prod" {
  type        = list(string)
  default     = ["seed-data"]
  description = "Arguments to pass to the initial data import process for the production cluster"
}

variable "data_import_arguments_staging" {
  type        = list(string)
  default     = ["seed-data"]
  description = "Arguments to pass to the initial data import process for the staging cluster"
}

variable "data_s3_access_key" {
  type        = string
  sensitive   = true
  description = "Science AWS S3 bucket access key"
}

variable "data_s3_secret_key" {
  type        = string
  sensitive   = true
  description = "Science AWS S3 bucket secret key"
}

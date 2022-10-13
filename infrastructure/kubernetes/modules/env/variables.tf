variable "project_name" {
  default     = "landgriffon"
  type        = string
  description = "A project namespace for the infrastructure."
}

variable "environment" {
  type        = string
  description = "An environment namespace for the infrastructure."
}

variable "aws_region" {
  default     = "eu-west-3"
  type        = string
  description = "A valid AWS region to configure the underlying AWS SDK."
}

variable "repo_name" {
  type        = string
  description = "Name of the github repo where the project is hosted"
}

variable "cluster_name" {
  type        = string
  description = "The k8s cluster name"
}

variable "domain" {
  type        = string
  description = "Domain where the app is publicly available"
}

variable "private_subnet_ids" {
  type = list(string)
  description = "IDs of the subnets used in the EKS cluster"
}

variable "image_tag" {
  type        = string
  description = "The tag to use when pulling docker images"
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

variable "load_fresh_data" {
  type        = bool
  default     = false
  description = "If a new data import should be triggered. Clears the current database."
}

variable "data_import_arguments" {
  type        = list(string)
  default     = ["seed-data"]
  description = "Arguments to pass to the initial data import process"
}

variable "api_container_registry_url" {
  type        = string
  description = "URL for the API container registry"
}

variable "client_container_registry_url" {
  type        = string
  description = "URL for the client container registry"
}

variable "data_import_container_registry_url" {
  type        = string
  description = "URL for the data import container registry"
}

variable "api_env_vars" {
  type = list(object({
    name = string
    value = string
  }))
  description = "Key-value pairs of env vars to make available to the api container"
  default = []
}


variable "api_secrets" {
  type = list(object({
    name = string
    secret_name = string
    secret_key = string
  }))
  description = "List of secrets to make available to the api container"
  default = []
}

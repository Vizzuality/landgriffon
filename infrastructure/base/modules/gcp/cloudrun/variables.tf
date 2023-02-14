variable "name" {
  type = string
}

variable "region" {
  type        = string
  description = "GCP region"
}

variable "project_id" {
  type        = string
  description = "GCP project id"
}

variable "image_name" {
  type        = string
  description = "Docker image name"
}

variable "start_command" {
  type        = string
  description = "Docker image start command"
}

variable "container_port" {
  type        = number
  description = "Port in which the running service is running"
}

variable "env_vars" {
  type = list(object({
    name  = string
    value = string
  }))
  description = "Key-value pairs of env vars to make available to the container"
  default     = []
}

variable "secrets" {
  type = list(object({
    name        = string
    secret_name = string
  }))
  description = "List of secrets to make available to the container"
  default     = []
}

variable "vpc_connector_name" {
  type        = string
  description = "Name of the VPC Access Connector"
}

variable "min_scale" {
  type        = number
  description = "Minimum number of app instances to deploy"
  default     = 0
}

variable "max_scale" {
  type        = number
  description = "Maximum number of app instances to deploy"
  default     = 5
}

variable "tag" {
  type        = string
  description = "Tag name to use for docker image tagging and deployment"
}

variable "developer_service_account" {
  description = "A service account to which `developer` role will be granted"
}

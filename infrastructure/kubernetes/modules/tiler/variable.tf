variable "cluster_name" {
  type        = string
  description = "The k8s cluster name"
}

variable "image" {
  type        = string
  description = "The dockerhub image reference to deploy"
}

variable "deployment_name" {
  type        = string
  description = "The k8s deployment name"
}

variable "namespace" {
  type        = string
  description = "The k8s namespace to use"
}

variable "env_vars" {
  type = list(object({
    name  = string
    value = string
  }))
  description = "Key-value pairs of env vars to make available to the container"
  default     = []
}

variable "tiler_secrets" {
  type = list(object({
    name        = string
    secret_name = string
    secret_key  = string
  }))
  description = "List of secrets to make available to the container"
  default     = []
}

variable "tiler_env_vars" {
  type = list(object({
    name  = string
    value = string
  }))
  description = "Key-value pairs of env vars to make available to the container"
  default     = []
}

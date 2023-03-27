variable "image" {
  type        = string
  description = "The dockerhub image reference to deploy"
}

variable "job_name" {
  type        = string
  description = "The job name"
}

variable "namespace" {
  type        = string
  description = "The k8s namespace to use"
}

variable "arguments" {
  type        = list(string)
  description = "The k8s namespace to use"
}

variable "load_data" {
  type        = bool
  default     = false
  description = "If new data should be loaded when this terraform plan is applied. Clears the current database."
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
    secret_key  = string
  }))
  description = "List of secrets to make available to the container"
  default     = []
}

variable "cluster_endpoint" {
  type        = string
  description = "The k8s cluster endpoint. Must be accessible from localhost"
}

variable "cluster_ca" {
  type        = string
  description = "The k8s CA string"
}

variable "cluster_name" {
  type        = string
  description = "The k8s cluster name"
}

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

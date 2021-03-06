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
  description = "The dockerhub image reference to deploy"
}

variable "namespace" {
  type        = string
  description = "The k8s namespace to use"
}

variable "site_url" {
  type        = string
  description = "Site URL to use"
}

variable "api_url" {
  type        = string
  description = "API URL to use"
}

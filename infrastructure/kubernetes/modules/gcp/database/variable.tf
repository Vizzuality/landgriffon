variable "region" {
  type        = string
  description = "GCP region"
}

variable "namespace" {
  type        = string
  description = "The k8s namespace to use"
}

variable "username" {
  type = string
}

variable "password" {
  type = string
}

variable "database" {
  type = string
}

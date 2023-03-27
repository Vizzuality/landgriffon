variable "project" {
  description = "Name of the GCP project"
  type        = string
}

variable "region" {
  description = "A valid GCP region to configure the underlying GCP SDK."
  type        = string
}

variable "domain" {
  type        = string
  description = "Domain where the app is publicly available"
}

variable "namespace" {
  type        = string
  description = "The k8s namespace to use"
}

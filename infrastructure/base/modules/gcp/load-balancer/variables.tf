variable "project" {
  type        = string
  description = "The GCP project to deploy service into"
}

variable "region" {
  type        = string
  description = "The GCP region to deploy service into"
}

variable "name" {
  type        = string
  description = "Name to use on resources"
}

variable "domain" {
  type        = string
  description = "Base domain for the DNS zone"
}

variable "frontend_cloud_run_name" {
  type        = string
  description = "Name of the frontend Cloud Run service"
}

variable "subdomain" {
  type        = string
  default     = ""
  description = "If set, it will be prepended to the domain to form a subdomain."
}

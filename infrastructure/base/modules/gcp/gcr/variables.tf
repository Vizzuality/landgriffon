variable "project_id" {
  type        = string
  description = "GCP project id"
}

variable "region" {
  type        = string
  description = "GCP region"
}

variable "name" {
  type        = string
  description = "Repository name"
}

variable "service_account" {
  description = "Service account to grant write access to the repo"
}

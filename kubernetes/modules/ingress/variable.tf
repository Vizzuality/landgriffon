variable "namespace" {
  type        = string
  description = "The k8s namespace to use"
}

variable "domain_prefix" {
  type    = string
  default = null
}

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

variable "allowed_account_id" {
  type        = string
  description = "Allowed AWS Account ID"
}

variable "aws_region" {
  type        = string
  description = "A valid AWS region to configure the underlying AWS SDK."
}

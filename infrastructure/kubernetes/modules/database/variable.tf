variable "cluster_name" {
  type        = string
  description = "The k8s cluster name"
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

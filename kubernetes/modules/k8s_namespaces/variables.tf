variable "cluster_name" {
  type        = string
  description = "The k8s cluster name"
}

variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "The name of the AWS region where the cluster lives"
}

variable "namespaces" {
  description = "Namespace list"
  type        = list(string)
}

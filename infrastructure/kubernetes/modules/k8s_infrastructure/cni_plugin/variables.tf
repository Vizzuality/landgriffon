variable "cluster_name" {
  type        = string
  description = "The k8s cluster name"
}

variable "aws_region" {
  type        = string
  description = "The name of the AWS region where the cluster lives"
}

variable "vpc_cni_addon_version" {
  type        = string
  description = "Version of AWS VPC CNI addon to use"
}


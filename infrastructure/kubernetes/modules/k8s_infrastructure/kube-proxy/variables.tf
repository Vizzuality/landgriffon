variable "cluster_name" {
  type        = string
  description = "The k8s cluster name"
}

variable "aws_region" {
  type        = string
  description = "The name of the AWS region where the cluster lives"
}

variable "kube_proxy_addon_version" {
  type        = string
  description = "Version of AWS Kube proxy addon to use"
}


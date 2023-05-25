variable "cluster_name" {
  type        = string
  description = "The k8s cluster name"
}

variable "vpc_id" {
  type        = string
  description = "The id of the VPC"
}

variable "aws_region" {
  type        = string
  default     = "us-east-1"
  description = "The name of the AWS region where the cluster lives"
}

variable "deploy_metrics_server" {
  type        = bool
  description = "If AWS Metrics server should be deployed"
}

variable "vpc_cni_addon_version" {
  type        = string
  description = "Version of AWS VPC CNI addon to use"
}

variable "kube_proxy_addon_version" {
  type        = string
  description = "Version of AWS Kube proxy addon to use"
}

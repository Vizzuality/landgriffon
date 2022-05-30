variable "cluster_name" {
  type        = string
  description = "The k8s cluster name"
}

variable "aws_region" {
  type        = string
  description = "The name of the AWS region where the cluster lives"
}

variable "aws_load_balancer_controller_version" {
  description = "The AWS Load Balancer Controller version to use. See https://github.com/kubernetes-sigs/aws-load-balancer-controller/releases for available versions"
  type        = string
  default     = "v2.4.2"
}

variable "aws_load_balancer_controller_chart_version" {
  description = "The AWS Load Balancer Controller chart version to use. See https://artifacthub.io/packages/helm/aws/aws-load-balancer-controller for available versions"
  type        = string
  default     = "1.4.2"
}

variable "k8s_namespace" {
  description = "Kubernetes namespace to deploy the AWS Load Balancer Controller into."
  type        = string
  default     = "default"
}

variable "target_groups" {
  description = "ARNs for existing load balancers that should be added via TargetGroupBindings. See https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.1/guide/targetgroupbinding/targetgroupbinding/ for details"
  type        = any
  default     = []
}

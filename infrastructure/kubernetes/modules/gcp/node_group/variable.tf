variable "node_group_name" {
  type        = string
  description = "Name of the node group"
}

variable "cluster_name" {
  type        = string
  description = "Name of the EKS cluster to which this node group will be attached"
}

variable "region" {
  type        = string
  description = "GCP region"
}

variable "zone" {
  description = "A valid GCP zone to configure the underlying GCP SDK."
  type        = string
}

variable "min_size" {
  type        = number
  default     = 1
  description = "Minimum number of nodes in the group"
}

variable "max_size" {
  type        = number
  default     = 1
  description = "Maximum number of nodes in the group"
}

variable "instance_type" {
  type        = string
  description = "Name of the Compute Instance type to use"
  default     = "e2-standard-32"
}

variable "namespace" {
  type        = string
  description = "The k8s namespace to use"
}

variable "labels" {
  type        = map(string)
  default     = {}
  description = "Labels to apply to nodes"
}

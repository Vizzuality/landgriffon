variable "subnet_ids" {
  type        = list(string)
  description = "A list of public subnet ids to which the EKS cluster will be connected."
}

variable "aws_region" {
  type        = string
  description = "A valid AWS region to house VPC resources."
}

variable "project" {
  type        = string
  description = "A project namespace for the infrastructure."
}

variable "vpc_id" {
  type        = string
  description = "ID of the VPC."
}


variable "k8s_version" {
  type        = string
  description = "Version of Kubernetes to use"
  default     = "1.21"
}

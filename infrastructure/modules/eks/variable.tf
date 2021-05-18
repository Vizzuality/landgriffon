variable "subnet_ids" {
  type        = list(string)
  description = "A list of public subnet ids to which the EKS cluster will be connected."
}

variable "project" {
  type        = string
  description = "A project namespace for the infrastructure."
}

variable "vpc_id" {
  type        = string
  description = "ID of the VPC."
}

variable "project" {
  type        = string
  description = "A project namespace for the infrastructure."
}

variable "region" {
  type        = string
  description = "A valid AWS region to house VPC resources."
}

variable "vpc" {
  type = object({
    id         = string
    cidr_block = string
  })
  description = "VPC to which the bastion host will belong"
}

variable "subnet_id" {
  type = string
}

variable "availability_zones" {
  type        = list(string)
  default     = ["eu-west-3a", "eu-west-3b", "eu-west-3c"]
  description = "A list of availability zones for subnet placement."
}

variable "bastion_ami" {
  type        = string
  description = "An AMI ID for the bastion."
}

variable "bastion_instance_type" {
  default     = "t3.micro"
  type        = string
  description = "An instance type for the bastion."
}

variable "tags" {
  default     = {}
  type        = map(string)
  description = "A mapping of keys and values to apply as tags to all resources that support them."
}

variable "user_data" {
  type        = string
  description = "User data for bootstrapping Bastion host"
}

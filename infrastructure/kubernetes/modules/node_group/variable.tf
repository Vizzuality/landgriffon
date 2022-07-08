variable "node_group_name" {
  type        = string
  description = "Name of the node group"
}

variable "cluster_name" {
  type        = string
  description = "Name of the EKS cluster to which this node group will be attached"
}

variable "subnet_ids" {
  type        = list(string)
  description = "A list of public subnet ids to which the EKS cluster will be connected."
}

variable "desired_size" {
  type        = number
  default     = 1
  description = "Number of desired nodes in the group"
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

variable "labels" {
  type        = map(string)
  default     = {}
  description = "Labels to apply to nodes"
}

variable "instance_types" {
  type        = string
  description = "Name of the EC2 instance type to use"
}


variable "instance_disk_size" {
  type        = number
  default     = 50
  description = "Disk size of the EC2 instances to use"
}


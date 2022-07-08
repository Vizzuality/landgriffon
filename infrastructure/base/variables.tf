variable "project_name" {
  default     = "landgriffon"
  type        = string
  description = "A project namespace for the infrastructure."
}

variable "environment" {
  type        = string
  description = "An environment namespace for the infrastructure."
}

variable "domain" {
  type        = string
  description = "The base domain name"
}

variable "aws_region" {
  default     = "eu-west-3"
  type        = string
  description = "A valid AWS region to configure the underlying AWS SDK."
}

variable "dynamo_db_lock_table_name" {
  default     = "aws-locks"
  type        = string
  description = "Name of the lock table in Dynamo DB"
}

variable "tf_state_bucket" {
  type        = string
  description = "The name of the S3 bucket where the state is stored"
}

variable "allowed_account_id" {
  type        = string
  description = "Allowed AWS Account ID"
}

#
# RDS configuration
#
variable "rds_log_retention_period" {
  type        = number
  default     = 1
  description = "Time in days to keep log files in cloud watch"
}

variable "rds_engine_version" {
  type        = string
  description = "RDS Database engine version"
}

variable "rds_instance_class" {
  type        = string
  default     = "db.t3.micro"
  description = "Instance type of Aurora PostgreSQL server"
}

variable "rds_instance_count" {
  type        = number
  default     = 1
  description = "Number of Aurora PostgreSQL instances before autoscaling"
}

variable "rds_backup_retention_period" {
  type        = number
  default     = 7
  description = "Time in days to keep db backups"
}

#
# EKS default node group
#

variable "default_node_group_instance_types" {
  type    = string
  default = "m5a.xlarge"
}

variable "default_node_group_min_size" {
  type    = number
  default = 1
}

variable "default_node_group_max_size" {
  type    = number
  default = 3
}

variable "default_node_group_desired_size" {
  type    = number
  default = 1
}

variable "data_node_group_instance_types" {
  type    = string
  default = "c5a.xlarge"
}

variable "data_node_group_min_size" {
  type    = number
  default = 1
}

variable "data_node_group_max_size" {
  type    = number
  default = 3
}

variable "data_node_group_desired_size" {
  type    = number
  default = 1
}

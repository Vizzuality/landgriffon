variable "project_id" {
  type        = string
  description = "GCP project id"
}

variable "repository_path" {
  type    = string
  description = "Github repo path"
  default = "Vizzuality/landgriffon"
}
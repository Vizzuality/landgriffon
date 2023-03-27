variable "region" {
  description = "A valid GCP region to configure the underlying GCP SDK."
  type        = string
}

variable "zone" {
  description = "A valid GCP zone to configure the underlying GCP SDK."
  type        = string
}

variable "project" {
  description = "Name of the GCP project"
  type        = string
}

variable "cluster_name" {
  description = "Name of the GKE cluster"
  type        = string
}

variable "node_pool_name" {
  description = "Name of the GKE node pool"
  type        = string
}

variable "network" {
  description = "Name of the VPC network"
  type        = string
}


variable "subnetwork" {
  description = "Name of the VPC subnet"
  type        = string
}

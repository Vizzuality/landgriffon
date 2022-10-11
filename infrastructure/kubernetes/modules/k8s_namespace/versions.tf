terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.14.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.34.0"
    }
  }
  required_version = "~> 1.3.2"
}

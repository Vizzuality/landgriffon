terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.11.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.61.0"
    }
  }
  required_version = "~> 1.2.0"
}

provider "aws" {
  region = var.aws_region
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

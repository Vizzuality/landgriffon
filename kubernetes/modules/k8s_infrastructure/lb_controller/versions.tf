terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.37"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.3"
    }
  }
  required_version = "0.15.0"
}

provider "aws" {
  region = "eu-west-3"
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

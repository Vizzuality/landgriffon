terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.61.0"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.11.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.1.0"
    }
  }
  required_version = "~> 1.2.0"
}

provider "aws" {
  region              = var.aws_region
  allowed_account_ids = [var.allowed_account_id]
}

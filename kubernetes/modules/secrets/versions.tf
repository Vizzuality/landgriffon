terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.37"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.3.2"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.1.0"
    }
  }
  required_version = "0.15.0"
}

provider "aws" {
  region              = var.aws_region
  allowed_account_ids = [var.allowed_account_id]
}

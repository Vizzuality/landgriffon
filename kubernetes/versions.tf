terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.61.0"
    }
    template = {
      source = "hashicorp/template"
    }
  }
  required_version = "~> 1.2.0"
}

provider "aws" {
  region              = "eu-west-3"
  allowed_account_ids = [var.allowed_account_id]
}

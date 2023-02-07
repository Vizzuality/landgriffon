terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.34.0"
    }
    template = {
      source = "hashicorp/template"
    }
    google = {
      source  = "hashicorp/google"
      version = "4.51.0"
    }
    github = {
      source  = "integrations/github"
      version = "5.17.0"
    }
  }
  required_version = "~> 1.3.2"
}

provider "aws" {
  region              = var.aws_region
  allowed_account_ids = [var.allowed_account_id]
}

provider "google" {
  region  = var.gcp_region
  project = var.gcp_project_id
}

# https://github.com/integrations/terraform-provider-github/issues/667#issuecomment-1182340862
provider "github" {
#  owner = "Vizzuality"
}

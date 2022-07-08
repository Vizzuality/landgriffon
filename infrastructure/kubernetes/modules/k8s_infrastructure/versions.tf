terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.22.0"
    }

    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "~> 1.11.3"
    }

    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.3.0"
    }
  }
  required_version = "~> 1.2.0"
}

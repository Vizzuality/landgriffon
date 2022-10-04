terraform {
  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.11.0"
    }

    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.3.0"
    }
  }
  required_version = "~> 1.2.0"
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 3.61.0"
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

provider "aws" {
  region = var.aws_region
}

provider "helm" {
  kubernetes {
    host                   = var.cluster_endpoint
    cluster_ca_certificate = base64decode(var.cluster_ca)
    exec {
      api_version = "client.authentication.k8s.io/v1alpha1"
      args = [
        "eks",
        "get-token",
        "--cluster-name",
        var.cluster_name
      ]
      command = "aws"
    }
  }
}

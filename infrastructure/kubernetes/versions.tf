terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.22.0"
    }

    template = {
      source = "hashicorp/template"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "2.11.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.1.0"
    }

    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.3.0"
    }

    kubectl = {
      source  = "gavinbunney/kubectl"
      version = ">= 1.7.0"
    }

  }
  required_version = "~> 1.2.0"
}

provider "aws" {
  region              = "eu-west-3"
  allowed_account_ids = [var.allowed_account_id]
}

provider "kubernetes" {
  config_path = "~/.kube/config"
}

provider "helm" {
  kubernetes {
    host                   = "${data.terraform_remote_state.core.outputs.eks_cluster.endpoint}:4433"
    cluster_ca_certificate = base64decode(data.terraform_remote_state.core.outputs.eks_cluster.certificate_authority.0.data)
    exec {
      api_version = "client.authentication.k8s.io/v1alpha1"
      args = [
        "eks",
        "get-token",
        "--cluster-name",
        data.terraform_remote_state.core.outputs.eks_cluster_name
      ]
      command = "aws"
    }
  }
}

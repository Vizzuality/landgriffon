terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.34.0"
    }

    template = {
      source = "hashicorp/template"
    }

    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.14.0"
    }

    random = {
      source  = "hashicorp/random"
      version = "~> 3.4.3"
    }

    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.7.0"
    }

    kubectl = {
      source  = "gavinbunney/kubectl"
      version = "~> 1.14.0"
    }

    github = {
      source  = "integrations/github"
      version = "~> 5.3.0"
    }
  }
  required_version = "~> 1.3.2"
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
    host                   = "${data.aws_eks_cluster.cluster.endpoint}:4433"
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority.0.data)
    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
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

# https://github.com/integrations/terraform-provider-github/issues/667#issuecomment-1182340862
provider "github" {
#  owner = "vizzuality"
}

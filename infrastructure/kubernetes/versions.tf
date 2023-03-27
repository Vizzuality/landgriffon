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
      version = "5.17.0"
    }

    google = {
      source  = "hashicorp/google"
      version = "4.51.0"
    }
  }
  required_version = "~> 1.3.2"
}

provider "aws" {
  region              = "eu-west-3"
  allowed_account_ids = [var.allowed_account_id]
}

provider "google" {
  region  = var.gcp_region
  project = var.gcp_project_id
}

provider "kubernetes" {
  alias          = "aws_kubernetes"
  config_path    = "~/.kube/config"
  config_context = "aws_landgriffon"
}

provider "kubernetes" {
  alias          = "gcp_kubernetes"
  config_path    = "~/.kube/config"
  config_context = "gcp_landgriffon"
}

provider "helm" {
  alias = "aws_helm"
  kubernetes {
    host                   = "${data.aws_eks_cluster.cluster.endpoint}:4433"
    cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority.0.data)
    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      args        = [
        "eks",
        "get-token",
        "--cluster-name",
        data.terraform_remote_state.core.outputs.eks_cluster_name
      ]
      command = "aws"
    }
  }
}

data "google_client_config" "default" {}

provider "helm" {
  alias = "gcp_helm"
  kubernetes {
    host                   = "https://${data.google_container_cluster.cluster.endpoint}"
    token                  = data.google_client_config.default.access_token
    cluster_ca_certificate = base64decode(data.google_container_cluster.cluster.master_auth[0].cluster_ca_certificate)
  }
}

# https://github.com/integrations/terraform-provider-github/issues/667#issuecomment-1182340862
provider "github" {
  #  owner = "vizzuality"
}

provider "kubectl" {
  alias = "aws_kubectl"

  host                   = "${data.aws_eks_cluster.cluster.endpoint}:4433"
  cluster_ca_certificate = base64decode(data.aws_eks_cluster.cluster.certificate_authority.0.data)
  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    args        = [
      "eks",
      "get-token",
      "--cluster-name",
      data.terraform_remote_state.core.outputs.eks_cluster_name
    ]
    command = "aws"
  }
}

provider "kubectl" {
  alias = "gcp_kubectl"

  kubernetes {
    host                   = data.google_container_cluster.cluster.endpoint
    token                  = data.google_client_config.default.access_token
    cluster_ca_certificate = base64decode(data.google_container_cluster.cluster.master_auth[0].cluster_ca_certificate)

  }
}

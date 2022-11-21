terraform {
  backend "s3" {
    region         = "eu-west-3"
    key            = "kubernetes.tfstate"
    dynamodb_table = "aws-locks"
    encrypt        = true
  }
}

data "terraform_remote_state" "core" {
  backend = "s3"
  config = {
    bucket = var.tf_state_bucket
    region = var.aws_region
    key    = "core.tfstate"
  }
}

data "aws_eks_cluster" "cluster" {
  name = data.terraform_remote_state.core.outputs.eks_cluster_name
}

module "k8s_infrastructure" {
  source                = "./modules/k8s_infrastructure"
  cluster_name          = data.terraform_remote_state.core.outputs.eks_cluster_name
  aws_region            = var.aws_region
  vpc_id                = data.aws_eks_cluster.cluster.vpc_config[0].vpc_id
  deploy_metrics_server = false
}

resource "github_actions_secret" "mapbox_api_token_secret" {
  repository      = var.repo_name
  secret_name     = "NEXT_PUBLIC_MAPBOX_API_TOKEN"
  plaintext_value = var.mapbox_api_token
}

module "environment" {
  for_each = merge(var.environments, {
    staging = merge({
      load_fresh_data       = false
      data_import_arguments = ["seed-data"]
      image_tag             = "staging"
    }, lookup(var.environments, "staging", {})),
    production = merge({
      load_fresh_data       = false
      data_import_arguments = ["seed-data"]
      image_tag             = "main"
    }, lookup(var.environments, "production", {})),
  })
  source = "./modules/env"

  cluster_name                       = data.terraform_remote_state.core.outputs.eks_cluster_name
  project_name                       = var.project_name
  environment                        = each.key
  aws_region                         = var.aws_region
  tf_state_bucket                    = var.tf_state_bucket
  allowed_account_id                 = var.allowed_account_id
  gmaps_api_key                      = var.gmaps_api_key
  load_fresh_data                    = lookup(each.value, "load_fresh_data", false)
  data_import_arguments              = lookup(each.value, "data_import_arguments", ["seed-data"])
  image_tag                          = lookup(each.value, "image_tag", each.key)
  private_subnet_ids                 = data.terraform_remote_state.core.outputs.private_subnet_ids
  repo_name                          = var.repo_name
  domain                             = var.domain
  api_container_registry_url         = data.terraform_remote_state.core.outputs.api_container_registry_url
  client_container_registry_url      = data.terraform_remote_state.core.outputs.client_container_registry_url
  data_import_container_registry_url = data.terraform_remote_state.core.outputs.data_import_container_registry_url
  api_env_vars                       = lookup(each.value, "api_env_vars", [])
  api_secrets                        = lookup(each.value, "api_secrets", [])
}

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
  config  = {
    bucket = var.tf_state_bucket
    region = var.aws_region
    key    = "core.tfstate"
  }
}

data "aws_eks_cluster" "cluster" {
  name = data.terraform_remote_state.core.outputs.eks_cluster_name
}

data "google_container_cluster" "cluster" {
  name     = data.terraform_remote_state.core.outputs.gke_cluster_name
  location = var.gcp_zone
  project  = var.gcp_project_id
}


resource "aws_iam_access_key" "access_key" {
  user = data.terraform_remote_state.core.outputs.raw_s3_reader.name
}

module "k8s_infrastructure" {
  source                = "./modules/k8s_infrastructure"
  cluster_name          = data.terraform_remote_state.core.outputs.eks_cluster_name
  aws_region            = var.aws_region
  vpc_id                = data.aws_eks_cluster.cluster.vpc_config[0].vpc_id
  deploy_metrics_server = false

  providers = {
    helm       = helm.aws_helm
    kubectl    = kubectl.aws_kubectl
    kubernetes = kubernetes.aws_kubernetes
  }
}

resource "github_actions_secret" "mapbox_api_token_secret" {
  repository      = var.repo_name
  secret_name     = "NEXT_PUBLIC_MAPBOX_API_TOKEN"
  plaintext_value = var.mapbox_api_token
}

module "aws_environment" {
  for_each = merge(var.aws_environments, {
    staging = merge({
      load_fresh_data       = false
      data_import_arguments = ["seed-data"]
      image_tag             = "staging"
    }, lookup(var.aws_environments, "staging", {})),
    production = merge({
      load_fresh_data       = false
      data_import_arguments = ["seed-data"]
      image_tag             = "main"
    }, lookup(var.aws_environments, "production", {})),
  })
  source = "./modules/aws/env"

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
  repo_branch                        = lookup(each.value, "image_tag", each.key)
  private_subnet_ids                 = data.terraform_remote_state.core.outputs.private_subnet_ids
  repo_name                          = var.repo_name
  domain                             = var.domain
  api_container_registry_url         = data.terraform_remote_state.core.outputs.aws_api_container_registry_url
  client_container_registry_url      = data.terraform_remote_state.core.outputs.aws_client_container_registry_url
  tiler_container_registry_url       = data.terraform_remote_state.core.outputs.aws_tiler_container_registry_url
  data_import_container_registry_url = data.terraform_remote_state.core.outputs.aws_data_import_container_registry_url
  api_env_vars                       = lookup(each.value, "api_env_vars", [])
  api_secrets                        = lookup(each.value, "api_secrets", [])
  science_bucket_name                = data.terraform_remote_state.core.outputs.science_bucket_name

  providers = {
    kubernetes = kubernetes.aws_kubernetes
    helm       = helm.aws_helm
  }
}

module "gcp_environment" {
  for_each = var.gcp_environments
  source   = "./modules/gcp/env"

  cluster_name                       = data.google_container_cluster.cluster.name
  project_name                       = var.project_name
  environment                        = each.key
  tf_state_bucket                    = var.tf_state_bucket
  allowed_account_id                 = var.allowed_account_id
  gmaps_api_key                      = var.gmaps_api_key
  load_fresh_data                    = lookup(each.value, "load_fresh_data", false)
  data_import_arguments              = lookup(each.value, "data_import_arguments", ["seed-data"])
  image_tag                          = lookup(each.value, "image_tag", each.key)
  repo_branch                        = lookup(each.value, "repo_branch", each.key)
  private_subnet_ids                 = data.terraform_remote_state.core.outputs.private_subnet_ids
  repo_name                          = var.repo_name
  domain                             = var.domain
  api_container_registry_url         = data.terraform_remote_state.core.outputs.gcp_api_container_registry_url
  client_container_registry_url      = data.terraform_remote_state.core.outputs.gcp_client_container_registry_url
  tiler_container_registry_url       = data.terraform_remote_state.core.outputs.gcp_tiler_container_registry_url
  data_import_container_registry_url = data.terraform_remote_state.core.outputs.gcp_data_import_container_registry_url
  api_env_vars                       = lookup(each.value, "api_env_vars", [])
  api_secrets                        = lookup(each.value, "api_secrets", [])
  science_bucket_name                = data.terraform_remote_state.core.outputs.science_bucket_name
  gcp_project                        = var.gcp_project_id
  gcp_region                         = var.gcp_region
  gcp_zone                           = var.gcp_zone
  aws_access_key_id                  = aws_iam_access_key.access_key.id
  aws_secret_access_key              = aws_iam_access_key.access_key.secret

  providers = {
    kubernetes = kubernetes.gcp_kubernetes
    helm       = helm.gcp_helm
  }
}

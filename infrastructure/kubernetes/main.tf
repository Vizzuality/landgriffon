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

module "k8s_infrastructure" {
  source                = "./modules/k8s_infrastructure"
  cluster_name          = data.terraform_remote_state.core.outputs.eks_cluster_name
  aws_region            = var.aws_region
  vpc_id                = data.terraform_remote_state.core.outputs.eks_cluster.vpc_config[0].vpc_id
  deploy_metrics_server = false
}

module "environment" {
  for_each = merge(var.environments, {
    staging = {
      load_fresh_data       = var.load_fresh_data_staging
      data_import_arguments = var.data_import_arguments_staging
      image_tag             = "staging"
    },
    production = {
      load_fresh_data       = var.load_fresh_data_prod
      data_import_arguments = var.data_import_arguments_prod
      image_tag             = "production"
    }
  })
  source = "./modules/env"

  cluster_name          = data.terraform_remote_state.core.outputs.eks_cluster_name
  project_name          = var.project_name
  environment           = each.key
  aws_region            = var.aws_region
  tf_state_bucket       = var.tf_state_bucket
  allowed_account_id    = var.allowed_account_id
  gmaps_api_key         = var.gmaps_api_key
  load_fresh_data       = lookup(each.value, "load_fresh_data", false)
  data_import_arguments = lookup(each.value, "data_import_arguments", ["seed-data"])
  image_tag             = lookup(each.value, "image_tag", "production")
  private_subnet_ids       = data.terraform_remote_state.core.outputs.private_subnet_ids
}

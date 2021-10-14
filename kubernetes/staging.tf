module "k8s_api_staging" {
  source           = "./modules/api"
  cluster_endpoint = "${data.terraform_remote_state.core.outputs.eks_cluster.endpoint}:4433"
  cluster_ca       = data.terraform_remote_state.core.outputs.eks_cluster.certificate_authority.0.data
  cluster_name     = data.terraform_remote_state.core.outputs.eks_cluster.name
  deployment_name  = "api"
  image            = "vizzuality/landgriffon-api:staging"
  namespace        = "staging"
}

module "k8s_client_staging" {
  source           = "./modules/client"
  cluster_endpoint = "${data.terraform_remote_state.core.outputs.eks_cluster.endpoint}:4433"
  cluster_ca       = data.terraform_remote_state.core.outputs.eks_cluster.certificate_authority.0.data
  cluster_name     = data.terraform_remote_state.core.outputs.eks_cluster.name
  deployment_name  = "client"
  image            = "vizzuality/landgriffon-client:staging"
  namespace          = "staging"
}

module "k8s_data_import_staging" {
  source           = "./modules/data_import"
  cluster_endpoint = "${data.terraform_remote_state.core.outputs.eks_cluster.endpoint}:4433"
  cluster_ca       = data.terraform_remote_state.core.outputs.eks_cluster.certificate_authority.0.data
  cluster_name     = data.terraform_remote_state.core.outputs.eks_cluster.name
  job_name         = "data-import"
  image            = "vizzuality/landgriffon-data-import:staging"
  namespace          = "staging"
}

module "k8s_secrets_staging" {
  source             = "./modules/secrets"
  cluster_endpoint   = "${data.terraform_remote_state.core.outputs.eks_cluster.endpoint}:4433"
  cluster_ca         = data.terraform_remote_state.core.outputs.eks_cluster.certificate_authority.0.data
  cluster_name       = data.terraform_remote_state.core.outputs.eks_cluster.name
  tf_state_bucket    = var.tf_state_bucket
  aws_region         = var.aws_region
  allowed_account_id = var.allowed_account_id
  namespace          = "staging"
  gmaps_api_key      = var.gmaps_api_key
}

module "k8s_ingress_staging" {
  source             = "./modules/ingress"
  cluster_endpoint   = "${data.terraform_remote_state.core.outputs.eks_cluster.endpoint}:4433"
  cluster_ca         = data.terraform_remote_state.core.outputs.eks_cluster.certificate_authority.0.data
  cluster_name       = data.terraform_remote_state.core.outputs.eks_cluster.name
  allowed_account_id = var.allowed_account_id
  aws_region         = var.aws_region
  namespace          = "staging"
  domain_prefix      = "staging"
}

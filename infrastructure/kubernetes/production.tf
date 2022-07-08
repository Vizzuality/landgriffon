module "k8s_api_prod" {
  source           = "./modules/api"
  cluster_endpoint = "${data.terraform_remote_state.core.outputs.eks_cluster.endpoint}:4433"
  cluster_ca       = data.terraform_remote_state.core.outputs.eks_cluster.certificate_authority.0.data
  cluster_name     = data.terraform_remote_state.core.outputs.eks_cluster.name
  deployment_name  = "api"
  image            = "vizzuality/landgriffon-api:production"
  namespace        = "production"
}

module "k8s_client_prod" {
  source           = "./modules/client"
  cluster_endpoint = "${data.terraform_remote_state.core.outputs.eks_cluster.endpoint}:4433"
  cluster_ca       = data.terraform_remote_state.core.outputs.eks_cluster.certificate_authority.0.data
  cluster_name     = data.terraform_remote_state.core.outputs.eks_cluster.name
  deployment_name  = "client"
  image            = "vizzuality/landgriffon-client:production"
  namespace        = "production"
  site_url         = module.k8s_ingress_prod.client_url
  api_url          = module.k8s_ingress_prod.api_url
}

module "k8s_data_import_prod" {
  source           = "./modules/data_import"
  cluster_endpoint = "${data.terraform_remote_state.core.outputs.eks_cluster.endpoint}:4433"
  cluster_ca       = data.terraform_remote_state.core.outputs.eks_cluster.certificate_authority.0.data
  cluster_name     = data.terraform_remote_state.core.outputs.eks_cluster.name
  job_name         = "data-import"
  image            = "vizzuality/landgriffon-data-import:production"
  namespace        = "production"
  load_data        = var.load_fresh_data_prod
  arguments        = var.data_import_arguments_prod
}

module "k8s_secrets_prod" {
  source             = "./modules/secrets"
  cluster_endpoint   = "${data.terraform_remote_state.core.outputs.eks_cluster.endpoint}:4433"
  cluster_ca         = data.terraform_remote_state.core.outputs.eks_cluster.certificate_authority.0.data
  cluster_name       = data.terraform_remote_state.core.outputs.eks_cluster.name
  tf_state_bucket    = var.tf_state_bucket
  aws_region         = var.aws_region
  allowed_account_id = var.allowed_account_id
  namespace          = "production"
  gmaps_api_key      = var.gmaps_api_key
}

module "k8s_ingress_prod" {
  source             = "./modules/ingress"
  cluster_endpoint   = "${data.terraform_remote_state.core.outputs.eks_cluster.endpoint}:4433"
  cluster_ca         = data.terraform_remote_state.core.outputs.eks_cluster.certificate_authority.0.data
  cluster_name       = data.terraform_remote_state.core.outputs.eks_cluster.name
  allowed_account_id = var.allowed_account_id
  aws_region         = var.aws_region
  namespace          = "production"
}

#module "data_import" {
#  source = "./modules/fargate"
#  namespace        = "production"
#  postgresql_port = module.k8s_database.postgresql_service_port
#}

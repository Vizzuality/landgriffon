module "k8s_api_prod" {
  source           = "./modules/api"
  cluster_endpoint = "${data.terraform_remote_state.core.outputs.eks_cluster.endpoint}:4433"
  cluster_ca       = data.terraform_remote_state.core.outputs.eks_cluster.certificate_authority.0.data
  cluster_name     = data.terraform_remote_state.core.outputs.eks_cluster.name
  deployment_name  = "api"
  image            = "vizzuality/landgriffon-api:latest"
  namespace        = "production"
}

module "k8s_client_prod" {
  source           = "./modules/client"
  cluster_endpoint = "${data.terraform_remote_state.core.outputs.eks_cluster.endpoint}:4433"
  cluster_ca       = data.terraform_remote_state.core.outputs.eks_cluster.certificate_authority.0.data
  cluster_name     = data.terraform_remote_state.core.outputs.eks_cluster.name
  namespace          = "production"

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

module "k8s_namespace" {
  source       = "../k8s_namespace"
  cluster_name = var.cluster_name
  namespace    = var.environment
}

module "k8s_database" {
  source       = "../database"
  cluster_name = var.cluster_name
  namespace    = var.environment
  username     = module.k8s_secrets.postgres_username
  password     = module.k8s_secrets.postgres_password
  database     = module.k8s_secrets.postgres_database

  depends_on = [
    module.k8s_namespace
  ]
}

module "k8s_redis" {
  source       = "../redis"
  cluster_name = var.cluster_name
  namespace    = var.environment

  depends_on = [
    module.k8s_namespace
  ]
}

module "k8s_api" {
  source          = "../api"
  cluster_name    = var.cluster_name
  deployment_name = "api"
  image           = "vizzuality/landgriffon-api:${var.image_tag}"
  namespace       = var.environment

  depends_on = [
    module.k8s_namespace,
    module.k8s_database
  ]
}

module "k8s_client" {
  source          = "../client"
  cluster_name    = var.cluster_name
  deployment_name = "client"
  image           = "vizzuality/landgriffon-client:${var.image_tag}"
  namespace       = var.environment
  site_url        = module.k8s_ingress.client_url
  api_url         = module.k8s_ingress.api_url

  depends_on = [
    module.k8s_namespace
  ]
}

module "k8s_data_import" {
  source       = "../data_import"
  cluster_name = var.cluster_name
  job_name     = "data-import"
  image        = "vizzuality/landgriffon-data-import:${var.image_tag}"
  namespace    = var.environment
  load_data    = var.load_fresh_data
  arguments    = var.data_import_arguments

  depends_on = [
    module.k8s_namespace,
    module.k8s_database,
    module.data-import-group
  ]
}

module "k8s_secrets" {
  source             = "../secrets"
  cluster_name       = var.cluster_name
  tf_state_bucket    = var.tf_state_bucket
  aws_region         = var.aws_region
  allowed_account_id = var.allowed_account_id
  namespace          = var.environment
  gmaps_api_key      = var.gmaps_api_key

  depends_on = [
    module.k8s_namespace
  ]
}

module "k8s_ingress" {
  source             = "../ingress"
  cluster_name       = var.cluster_name
  allowed_account_id = var.allowed_account_id
  aws_region         = var.aws_region
  namespace          = var.environment

  depends_on = [
    module.k8s_namespace
  ]
}

module "data-import-group" {
  count              = var.load_fresh_data == true ? 1 : 0
  source             = "../node_group"
  cluster_name       = var.cluster_name
  node_group_name    = "data-import-node-group"
  instance_types     = "r5a.4xlarge"
  instance_disk_size = 750
  min_size           = 1
  max_size           = 2
  desired_size       = 1
  namespace          = var.environment
  subnet_ids         = [var.private_subnet_ids[0]]
  labels             = {
    type : "data-import-${var.environment}"
  }
}

#module "data_import" {
#  source = "../modules/fargate"
#  namespace        = var.environment
#  postgresql_port = module.k8s_database.postgresql_service_port
#}

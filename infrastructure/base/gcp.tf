module "network" {
  source     = "./modules/gcp/network"
  project_id = var.gcp_project_id
  region     = var.gcp_region
  name       = var.project_name
}

module "marketing_cloudrun" {
  source             = "./modules/gcp/cloudrun"
  name               = "${var.project_name}-marketing"
  region             = var.gcp_region
  project_id         = var.gcp_project_id
  image_name         = "marketing"
  container_port     = 3000
  start_command      = "start:prod"
  vpc_connector_name = module.network.vpc_access_connector_name
  tag                = var.marketing_site_tag

  depends_on = [module.marketing_gcr]
}

module "marketing_gcr" {
  source     = "./modules/gcp/gcr"
  project_id = var.gcp_project_id
  region     = var.gcp_region
  name       = "${var.project_name}-marketing"
}

module "workload_identity" {
  source     = "./modules/gcp/workload_identity"
  project_id = var.gcp_project_id
}


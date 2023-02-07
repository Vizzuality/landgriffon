module "github_actions_frontend_secrets" {
  source                        = "./modules/github_secrets"
  repo_name                     = var.repo_name
  sendgrid_api_key_contact      = var.marketing_site_sendgrid_api_key_contact
  sendgrid_api_key_subscription = var.marketing_site_sendgrid_api_key_subscription
  gcp_project                   = var.gcp_project_id
  gcp_region                    = var.gcp_region
  google_analytics              = var.marketing_site_google_analytics
}

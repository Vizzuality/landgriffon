resource "github_actions_secret" "sendgrid_api_key_subscription" {
  repository       = var.repo_name
  secret_name      = "SENDGRID_API_KEY_SUBSCRIPTION"
  plaintext_value  = var.sendgrid_api_key_subscription
}

resource "github_actions_secret" "sendgrid_api_key_contact" {
  repository       = var.repo_name
  secret_name      = "SENDGRID_API_KEY_CONTACT"
  plaintext_value  = var.sendgrid_api_key_contact
}

resource "github_actions_secret" "gcp_project" {
  repository       = var.repo_name
  secret_name      = "GCP_PROJECT"
  plaintext_value  = var.gcp_project
}

resource "github_actions_secret" "gcp_region" {
  repository       = var.repo_name
  secret_name      = "GCP_REGION"
  plaintext_value  = var.gcp_region
}

resource "google_project_service" "iamcredentials_api" {
  service            = "iamcredentials.googleapis.com"
  disable_on_destroy = false
}

resource "google_iam_workload_identity_pool" "github_pool" {
  project                   = var.project_id
  workload_identity_pool_id = "github-pool"
  display_name              = "GitHub pool"
  description               = "Identity pool for GitHub deployments"
}

resource "google_iam_workload_identity_pool_provider" "github" {
  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.github_pool.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-provider"
  attribute_mapping                  = {
    "google.subject"       = "assertion.sub"
    "attribute.actor"      = "assertion.actor"
    "attribute.aud"        = "assertion.aud"
    "attribute.repository" = "assertion.repository"
  }
  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account" "github_actions" {
  project      = var.project_id
  account_id   = "github-actions"
  display_name = "Service Account used for GitHub Actions"
}

resource "google_service_account_iam_member" "workload_identity_user" {
  service_account_id = google_service_account.github_actions.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github_pool.name}/attribute.repository/${var.repository_path}"
}

resource "google_project_iam_binding" "github_actions_allow_storage_get" {
  project = var.project_id
  role    = "roles/storage.objectAdmin" //TODO: limit

  members = [
    "serviceAccount:${google_service_account.github_actions.email}"
  ]
}

resource "google_project_iam_binding" "github_actions_artifact_registry_write" {
  project = var.project_id
  role    = "roles/artifactregistry.writer"

  members = [
    "serviceAccount:${google_service_account.github_actions.email}"
  ]
}

resource "google_project_iam_custom_role" "github_actions_allow_storage_get" {
  role_id     = "StorageBucketGet"
  title       = "StorageBucketGet Role"
  description = "Ability to read storage buckets"
  permissions = ["storage.buckets.get"]
}

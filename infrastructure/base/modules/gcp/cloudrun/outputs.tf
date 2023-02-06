output "name" {
  value = google_cloud_run_service.cloud_run.name
}

output "service_account_email" {
  value = google_service_account.service_account.email
}

output "cloudrun_service_url" {
  value = google_cloud_run_service.cloud_run.status[0].url
}

output "artifact_registry_repository_url" {
  value = "${google_artifact_registry_repository.repository.location}-docker.pkg.dev/${google_artifact_registry_repository.repository.project}/${google_artifact_registry_repository.repository.name}/main"
}

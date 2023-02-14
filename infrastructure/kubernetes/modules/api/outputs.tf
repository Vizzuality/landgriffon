output "api_service_name" {
  value       = kubernetes_service.api_service.metadata[0].name
  description = "Name for API Service"
}

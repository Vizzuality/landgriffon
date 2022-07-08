output "postgresql_service_port" {
  value       = data.kubernetes_service.postgresql.spec[0].port[0].node_port
  description = "PostgreSQL k8s service public port"
}

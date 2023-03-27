output "node_group_name" {
  value       = google_container_node_pool.node_pool.name
  description = "Node group name"
}

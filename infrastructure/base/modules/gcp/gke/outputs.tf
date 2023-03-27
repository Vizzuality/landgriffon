output "cluster_endpoint" {
  value = google_container_cluster.k8s_cluster.endpoint
}

output "cluster_name" {
  value = google_container_cluster.k8s_cluster.name
}

output "cluster_ca_certificate" {
  value = google_container_cluster.k8s_cluster.master_auth[0].cluster_ca_certificate
}

output "node_service_account" {
  value = google_service_account.eks-node-service-account
}

data "google_service_account" "eks-node-service-account" {
  account_id   = "eks-node-service-account"
}

resource "random_id" "eks-node-group" {
  keepers = {
    instance_types = var.instance_type
    namespace      = var.namespace
  }
  byte_length = 8
}

resource "google_container_node_pool" "node_pool" {
  name     = "${var.node_group_name}-${random_id.eks-node-group.hex}"
  location = var.zone
  cluster  = var.cluster_name

  management {
    auto_repair  = true
    auto_upgrade = true
  }

  autoscaling {
    max_node_count = var.max_size
    min_node_count = var.min_size
  }

  node_config {
    preemptible  = false
    machine_type = var.instance_type

    service_account = data.google_service_account.eks-node-service-account.email

    oauth_scopes = [
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
      "https://www.googleapis.com/auth/service.management.readonly",
      "https://www.googleapis.com/auth/servicecontrol",
      "https://www.googleapis.com/auth/trace.append",
      "https://www.googleapis.com/auth/sqlservice.admin",
    ]

    labels = var.labels
  }
}

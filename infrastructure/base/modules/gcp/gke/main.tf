resource "google_project_service" "container_api" {
  service            = "container.googleapis.com"
  disable_on_destroy = false
}

resource "google_container_cluster" "k8s_cluster" {
  name               = var.cluster_name
  location           = var.zone
  network            = var.network
  subnetwork         = var.subnetwork
  initial_node_count = 1

  networking_mode = "VPC_NATIVE"

  remove_default_node_pool = true

  release_channel {
    channel = "REGULAR"
  }

  ip_allocation_policy {
    cluster_ipv4_cidr_block  = "10.48.0.0/14"
    services_ipv4_cidr_block = "10.52.0.0/20"
  }
}

resource "google_service_account" "eks-node-service-account" {
  account_id   = "eks-node-service-account"
  display_name = "EKS Nodes Service Account"
}

resource "google_container_node_pool" "default-pool" {
  name     = var.node_pool_name
  location = var.zone
  cluster  = google_container_cluster.k8s_cluster.name

  management {
    auto_repair  = true
    auto_upgrade = true
  }

  autoscaling {
    max_node_count = 6
    min_node_count = 2
  }

  node_config {
    preemptible  = false
    machine_type = "n1-standard-2"

    service_account = google_service_account.eks-node-service-account.email

    oauth_scopes = [
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
      "https://www.googleapis.com/auth/service.management.readonly",
      "https://www.googleapis.com/auth/servicecontrol",
      "https://www.googleapis.com/auth/trace.append",
      "https://www.googleapis.com/auth/sqlservice.admin",
    ]

    labels = {
      type = "default"
    }
  }
}

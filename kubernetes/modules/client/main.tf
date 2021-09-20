data "aws_eks_cluster_auth" "cluster" {
  name = var.cluster_name
}

provider "kubernetes" {
  host                   = var.cluster_endpoint
  cluster_ca_certificate = base64decode(var.cluster_ca)
  token                  = data.aws_eks_cluster_auth.cluster.token
}

resource "kubernetes_service" "client_service" {
  metadata {
    name = kubernetes_deployment.client_deployment.metadata[0].name

  }
  spec {
    selector = {
      name = kubernetes_deployment.client_deployment.metadata[0].name
    }
    port {
      port = 3000
    }

    type = "NodePort"
  }
}

resource "kubernetes_deployment" "client_deployment" {
  metadata {
    name = "client"
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        name = "client"
      }
    }

    template {
      metadata {
        labels = {
          name = "client"
        }
      }

      spec {
        image_pull_secrets {
          name = "regcred"
        }

        container {
          image             = "vizzuality/landgriffon-client:latest"
          image_pull_policy = "Always"
          name              = "client"

          args = ["start:prod"]

          resources {
            limits = {
              cpu    = "1"
              memory = "512Mi"
            }
            requests = {
              cpu    = "250m"
              memory = "256Mi"
            }
          }

          liveness_probe {
            http_get {
              path   = "/"
              port   = 3000
              scheme = "HTTP"
            }

            success_threshold     = 1
            timeout_seconds       = 5
            initial_delay_seconds = 15
            period_seconds        = 15
          }

          readiness_probe {
            http_get {
              path   = "/"
              port   = 3000
              scheme = "HTTP"
            }

            success_threshold     = 1
            timeout_seconds       = 5
            initial_delay_seconds = 15
            period_seconds        = 15
          }
        }
      }
    }
  }
}

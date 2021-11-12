data "aws_eks_cluster_auth" "cluster" {
  name = var.cluster_name
}

provider "kubernetes" {
  host                   = var.cluster_endpoint
  cluster_ca_certificate = base64decode(var.cluster_ca)
  token                  = data.aws_eks_cluster_auth.cluster.token
}

resource "kubernetes_service" "api_service" {
  metadata {
    name      = kubernetes_deployment.api_deployment.metadata[0].name
    namespace = var.namespace
  }
  spec {
    selector = {
      name = kubernetes_deployment.api_deployment.metadata[0].name
    }
    port {
      port = 3000
    }

    type = "NodePort"
  }
}

resource "kubernetes_deployment" "api_deployment" {
  metadata {
    name      = var.deployment_name
    namespace = var.namespace
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        name = var.deployment_name
      }
    }

    template {
      metadata {
        labels = {
          name = var.deployment_name
        }
      }

      spec {
        image_pull_secrets {
          name = "regcred"
        }

        container {
          image             = var.image
          image_pull_policy = "Always"
          name              = var.deployment_name

          args = ["start:prod"]


          env {
            name = "DB_HOST"
            value_from {
              secret_key_ref {
                name = "db"
                key  = "DB_HOST"
              }
            }
          }

          env {
            name = "DB_USERNAME"
            value_from {
              secret_key_ref {
                name = "db"
                key  = "DB_USERNAME"
              }
            }
          }

          env {
            name = "DB_PASSWORD"
            value_from {
              secret_key_ref {
                name = "db"
                key  = "DB_PASSWORD"
              }
            }
          }

          env {
            name = "DB_DATABASE"
            value_from {
              secret_key_ref {
                name = "db"
                key  = "DB_DATABASE"
              }
            }
          }

          env {
            name  = "PORT"
            value = 3000
          }

          env {
            name  = "DB_SYNCHRONIZE"
            value = "true"
          }

          env {
            name = "JWT_SECRET"
            value_from {
              secret_key_ref {
                name = "api"
                key  = "JWT_SECRET"
              }
            }
          }

          env {
            name = "GMAPS_API_KEY"
            value_from {
              secret_key_ref {
                name = "api"
                key  = "GMAPS_API_KEY"
              }
            }
          }

          resources {
            limits = {
              cpu    = "1"
              memory = "2Gi"
            }
            requests = {
              cpu    = "500m"
              memory = "2Gi"
            }
          }

          liveness_probe {
            http_get {
              path   = "/health"
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
              path   = "/health"
              port   = 3000
              scheme = "HTTP"
            }

            success_threshold     = 1
            timeout_seconds       = 5
            initial_delay_seconds = 30
            period_seconds        = 15
          }
        }
      }
    }
  }
}

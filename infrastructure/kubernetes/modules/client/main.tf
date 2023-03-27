resource "kubernetes_service" "client_service" {
  metadata {
    name        = kubernetes_deployment.client_deployment.metadata[0].name
    namespace   = var.namespace
    annotations = {
      "alb.ingress.kubernetes.io/healthcheck-path" = "/auth/signin"
    }
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
    name      = "client"
    namespace = var.namespace
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
        affinity {
          node_affinity {
            required_during_scheduling_ignored_during_execution {
              node_selector_term {
                match_expressions {
                  key      = "type"
                  operator = "In"
                  values   = ["default"]
                }
              }
            }
          }
        }

        image_pull_secrets {
          name = "regcred"
        }

        container {
          image             = var.image
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

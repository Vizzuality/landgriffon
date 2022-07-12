data "aws_eks_cluster_auth" "cluster" {
  name = var.cluster_name
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
            name = "REDIS_HOST"
            value_from {
              secret_key_ref {
                name = "db"
                key  = "REDIS_HOST"
              }
            }
          }

          env {
            name = "REDIS_IMPORT_QUEUE_NAME"
            value_from {
              secret_key_ref {
                name = "db"
                key  = "REDIS_IMPORT_QUEUE_NAME"
              }
            }
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
            name = "JWT_EXPIRES_IN"
            value = "2h"
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

          env {
            name = "DISTRIBUTED_MAP"
            value = "true"
          }

          env {
            name = "REQUIRE_USER_AUTH"
            value = "true"
          }

          env {
            name = "DB_MIGRATIONS_RUN"
            value = "true"
          }

          resources {
            limits = {
              cpu    = "1"
              memory = "4Gi"
            }
            requests = {
              cpu    = "1"
              memory = "4Gi"
            }
          }

          liveness_probe {
            http_get {
              path   = "/health"
              port   = 3000
              scheme = "HTTP"
            }

            success_threshold     = 1
            timeout_seconds       = 25
            initial_delay_seconds = 15
            period_seconds        = 25
          }

          readiness_probe {
            http_get {
              path   = "/health"
              port   = 3000
              scheme = "HTTP"
            }

            success_threshold     = 1
            timeout_seconds       = 25
            initial_delay_seconds = 30
            period_seconds        = 25
          }
        }
      }
    }
  }
}



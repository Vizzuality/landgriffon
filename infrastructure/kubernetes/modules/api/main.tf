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

          dynamic "env" {
            for_each = concat(var.env_vars, var.secrets)
            content {
              name = env.value["name"]
              dynamic "value_from" {
                for_each = lookup(env.value, "secret_name", null) != null ? [1] : []
                content {
                  secret_key_ref {

                    name = env.value["secret_name"]
                    key  = env.value["secret_key"]
                  }
                }

              }
              value = lookup(env.value, "value", null) != null ? env.value["value"] : null
            }
          }

          resources {
            limits = {
              cpu    = "2"
              memory = "8Gi"
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



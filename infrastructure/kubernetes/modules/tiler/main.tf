resource "kubernetes_service" "tiler_service" {
  metadata {
    name      = kubernetes_deployment.tiler_deployment.metadata[0].name
    namespace = var.namespace
  }
  spec {
    selector = {
      name = kubernetes_deployment.tiler_deployment.metadata[0].name
    }
    port {
      port = 4000
    }

    type = "NodePort"
  }
}

resource "kubernetes_deployment" "tiler_deployment" {
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

          // TODO: configure tiler's uvicorn to use host and port via env vars
          //       configure a entrypoint as it is done with other services

          //args = ["uvicorn -h localhost -p 4000"]

          command = ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "4000"]

          dynamic "env" {
            for_each = concat(var.env_vars, var.tiler_secrets)
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
              cpu    = "1"
              memory = "2Gi"
            }
            requests = {
              cpu    = "1"
              memory = "2Gi"
            }
          }

          // TODO: This needs to be restored when the auth middleware applies only for the geotiff wrapper
          //         currently applies as global middleware

#          liveness_probe {
#            http_get {
#              path   = "/health"
#              port   = 4000
#              scheme = "HTTP"
#            }
#
#            success_threshold     = 1
#            timeout_seconds       = 25
#            initial_delay_seconds = 15
#            period_seconds        = 25
#          }

#          readiness_probe {
#            http_get {
#              path   = "/health"
#              port   = 4000
#              scheme = "HTTP"
#            }
#
#            success_threshold     = 1
#            timeout_seconds       = 25
#            initial_delay_seconds = 30
#            period_seconds        = 25
#          }
        }
      }
    }
  }
}



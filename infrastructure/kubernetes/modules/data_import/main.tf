resource "kubernetes_job" "data_import" {
  count = var.load_data ? 1 : 0

  metadata {
    name      = var.job_name
    namespace = var.namespace
  }

  spec {
    parallelism = 1
    completions = 1

    ttl_seconds_after_finished = "86400"

    template {
      metadata {
        labels = {
          name = var.job_name
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
                  values   = ["data-import-${var.namespace}"]
                }
              }
            }
          }
        }

        image_pull_secrets {
          name = "regcred"
        }

        restart_policy = "OnFailure"

        container {
          image             = var.image
          image_pull_policy = "Always"
          name              = var.job_name

          args = var.arguments

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
            requests = {
              cpu    = "15"
              memory = "110Gi"
            }
          }
        }
      }
    }
  }
}

data "aws_eks_cluster_auth" "cluster" {
  name = var.cluster_name
}

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

          env {
            name = "API_POSTGRES_HOST"
            value_from {
              secret_key_ref {
                name = "db"
                key  = "DB_HOST"
              }
            }
          }

          env {
            name  = "API_POSTGRES_PORT"
            value = "5432"
          }

          env {
            name = "API_POSTGRES_USERNAME"
            value_from {
              secret_key_ref {
                name = "db"
                key  = "DB_USERNAME"
              }
            }
          }

          env {
            name = "API_POSTGRES_PASSWORD"
            value_from {
              secret_key_ref {
                name = "db"
                key  = "DB_PASSWORD"
              }
            }
          }

          env {
            name = "API_POSTGRES_DATABASE"
            value_from {
              secret_key_ref {
                name = "db"
                key  = "DB_DATABASE"
              }
            }
          }

          env {
            name = "DATA_S3_ACCESS_KEY"
            value_from {
              secret_key_ref {
                name = "data"
                key  = "DATA_S3_ACCESS_KEY"
              }
            }
          }

          env {
            name = "DATA_S3_SECRET_KEY"
            value_from {
              secret_key_ref {
                name = "data"
                key  = "DATA_S3_SECRET_KEY"
              }
            }
          }





          resources {
            requests = {
              cpu    = "15"
              memory = "120Gi"
            }
          }
        }
      }
    }
  }
}

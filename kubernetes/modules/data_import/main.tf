data "aws_eks_cluster_auth" "cluster" {
  name = var.cluster_name
}

provider "kubernetes" {
  host                   = var.cluster_endpoint
  cluster_ca_certificate = base64decode(var.cluster_ca)
  token                  = data.aws_eks_cluster_auth.cluster.token
}

resource "kubernetes_job" "data_import" {
  metadata {
    name = var.job_name
    namespace = var.namespace
  }

  spec {
    parallelism = 1
    completions = 1

    template {
      metadata {
        labels = {
          name = var.job_name
        }
      }

      spec {
        image_pull_secrets {
          name = "regcred"
        }

        restart_policy = "OnFailure"

        container {
          image             = var.image
          image_pull_policy = "Always"
          name              = var.job_name

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

          resources {
            limits = {
              cpu    = "4"
              memory = "16Gi"
            }
            requests = {
              cpu    = "2"
              memory = "2Gi"
            }
          }
        }
      }
    }
  }
}

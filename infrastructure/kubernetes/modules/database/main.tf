locals {
  postgres_secret_json = {
    username       = "postgres"
    admin_password = random_password.postgresql_admin_generator.result
  }
}

resource "random_password" "postgresql_admin_generator" {
  length  = 24
  special = true
}

resource "aws_secretsmanager_secret" "postgresql_admin_secret" {
  name        = "postgresql-admin-credentials-${var.namespace}"
  description = "Credentials for the admin user of the K8S PostgreSQL Server"
}

resource "aws_secretsmanager_secret_version" "postgresql_admin_secret_version" {
  secret_id     = aws_secretsmanager_secret.postgresql_admin_secret.id
  secret_string = jsonencode(local.postgres_secret_json)
}

resource "helm_release" "postgres" {
  name       = "postgres"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "postgresql"
  version    = "11.6.15"
  namespace  = var.namespace

  values = [
    file("${path.module}/values.yaml")
  ]

  set {
    name  = "auth.username"
    value = sensitive(var.username)
  }

  set {
    name  = "auth.password"
    value = sensitive(var.password)
  }

  set {
    name  = "auth.database"
    value = sensitive(var.database)
  }

  set {
    name  = "auth.postgresPassword"
    value = sensitive(local.postgres_secret_json.admin_password)
  }

  set {
    name  = "image.repository"
    value = "vizzuality/landgriffon-database"
  }

  set {
    name  = "image.tag"
    value = "latest"
  }

  set {
    name  = "primary.persistence.size"
    value = "60Gi"
  }

  set {
    name  = "postgresql.podSecurityContext.enabled"
    value = false
  }

  set {
    name  = "primary.affinity"
    type  = "auto"
    value = yamlencode({
      nodeAffinity = {
        requiredDuringSchedulingIgnoredDuringExecution = {
          nodeSelectorTerms = [
            {
              matchExpressions = [{
                key      = "type",
                operator = "In",
                values   = ["data"]
              }]
            }
          ]
        }
      }
    })
  }
}

data "kubernetes_service" "postgresql" {
  metadata {
    name = "postgres-postgresql"
    namespace = var.namespace
  }
}

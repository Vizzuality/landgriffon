data "aws_secretsmanager_secret" "postgres_secret" {
  name = "landgriffon-postgresql-user-password"
}

data "aws_secretsmanager_secret_version" "postgres_secret_version" {
  secret_id = data.aws_secretsmanager_secret.postgres_secret.id
}

locals {
  postgres_secret_json = jsondecode(nonsensitive(data.aws_secretsmanager_secret_version.postgres_secret_version.secret_string))
}

resource "helm_release" "postgres" {
  name       = "postgres"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "postgresql"
  version    = "9.4.1"

  values = [
    file("${path.module}/values.yaml")
  ]

  set {
    name  = "postgresqlUsername"
    value = sensitive(local.postgres_secret_json.username)
  }

  set {
    name  = "postgresqlDatabase"
    value = "landgriffon"
  }

  set {
    name  = "existingSecret"
    value = "postgres-secret"
  }
}

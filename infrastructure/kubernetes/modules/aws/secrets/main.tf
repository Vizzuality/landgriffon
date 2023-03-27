locals {
  postgres_secret_json = {
    username = "landgriffon-${var.namespace}"
    password = random_password.postgresql_user_generator.result
    database = "landgriffon-${var.namespace}"
  }

  api_secret_json = {
    jwt_secret    = random_password.jwt_secret_generator.result
    gmaps_api_key = var.gmaps_api_key
  }
}

# JWT
resource "random_password" "jwt_secret_generator" {
  length  = 64
  special = true
}

resource "aws_secretsmanager_secret" "api_secret" {
  name        = "api-secret-${var.namespace}"
  description = "Credentials for the ${var.namespace} API"

}

resource "aws_secretsmanager_secret_version" "api_secret_version" {
  secret_id     = aws_secretsmanager_secret.api_secret.id
  secret_string = jsonencode(local.api_secret_json)
}

resource "kubernetes_secret" "api_secret" {
  metadata {
    name      = "api"
    namespace = var.namespace
  }

  data = {
    JWT_SECRET    = local.api_secret_json.jwt_secret
    GMAPS_API_KEY = local.api_secret_json.gmaps_api_key
  }
}

#Postgres
resource "random_password" "postgresql_user_generator" {
  length  = 24
  special = true
  lifecycle {
    ignore_changes = [
      length,
      lower,
      min_lower,
      min_numeric,
      min_special,
      min_upper,
      numeric,
      special,
      upper,

    ]
  }
}

resource "aws_secretsmanager_secret" "postgres_user_secret" {
  name        = "landgriffon-${var.namespace}-postgresql-user-password"
  description = "Credentials for the ${var.namespace} user of the K8S PostgreSQL Server"
}

resource "aws_secretsmanager_secret_version" "postgres_user_secret_version" {
  secret_id     = aws_secretsmanager_secret.postgres_user_secret.id
  secret_string = jsonencode(local.postgres_secret_json)
}


resource "kubernetes_secret" "db_secret" {
  metadata {
    name      = "db"
    namespace = var.namespace
  }

  data = {
    DB_HOST     = "postgres-postgresql.${var.namespace}.svc.cluster.local"
    DB_USERNAME = sensitive(local.postgres_secret_json.username)
    DB_PASSWORD = sensitive(local.postgres_secret_json.password)
    DB_DATABASE = sensitive(local.postgres_secret_json.database)
    REDIS_HOST  = "redis-master.${var.namespace}.svc.cluster.local"
  }
}


resource "kubernetes_secret" "data_secret" {
  metadata {
    name      = "data"
    namespace = var.namespace
  }
}





data "aws_eks_cluster_auth" "cluster" {
  name = var.cluster_name
}

provider "kubernetes" {
  host                   = var.cluster_endpoint
  cluster_ca_certificate = base64decode(var.cluster_ca)
  token                  = data.aws_eks_cluster_auth.cluster.token
}


# JWT
resource "random_password" "jwt_secret_generator" {
  length  = 64
  special = true
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name = "jwt-secret-${var.namespace}"
  description = "Credentials for the ${var.namespace} JWT token generation"

}

resource "kubernetes_secret" "api_secret" {
  metadata {
    name = "api"
    namespace = var.namespace
  }

  data = {
    JWT_SECRET = aws_secretsmanager_secret_version.jwt_secret_version.secret_string
  }
}


#Postgres
resource "random_password" "postgresql_user_generator" {
  length  = 24
  special = true
}

resource "aws_secretsmanager_secret" "postgres_user_secret" {
  name = "landgriffon-${var.namespace}-postgresql-user-password"
  description = "Credentials for the ${var.namespace} user of the K8S PostgreSQL Server"
}

resource "aws_secretsmanager_secret_version" "postgres_user_secret_version" {
  secret_id = aws_secretsmanager_secret.postgres_user_secret.id
  secret_string = jsonencode(local.postgres_secret_json)
}

resource "aws_secretsmanager_secret_version" "jwt_secret_version" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_password.jwt_secret_generator.result
}

locals {
  postgres_secret_json = {
    username = "landgriffon-${var.namespace}"
    password = random_password.postgresql_user_generator.result
  }
}

resource "kubernetes_secret" "db_secret" {
  metadata {
    name = "db"
    namespace = var.namespace
  }

  data = {
    DB_HOST        = "postgres-postgresql.default.svc.cluster.local"
    DB_USERNAME    = sensitive(local.postgres_secret_json.username)
    DB_PASSWORD    = sensitive(local.postgres_secret_json.password)
    DB_DATABASE    = "landgriffon-${var.namespace}"
    DB_SYNCHRONIZE = "true"
  }
}

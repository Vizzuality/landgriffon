data "aws_eks_cluster_auth" "cluster" {
  name = var.cluster_name
}

provider "kubernetes" {
  host                   = var.cluster_endpoint
  cluster_ca_certificate = base64decode(var.cluster_ca)
  token                  = data.aws_eks_cluster_auth.cluster.token
}

resource "random_password" "jwt_secret_generator" {
  length  = 64
  special = true
}

resource "aws_secretsmanager_secret" "jwt_secret" {
  name = "jwt-secret"
}

data "aws_secretsmanager_secret" "postgres_secret" {
  name = "landgriffon-postgresql-user-password"
}

data "aws_secretsmanager_secret_version" "postgres_secret_version" {
  secret_id = data.aws_secretsmanager_secret.postgres_secret.id
}

resource "aws_secretsmanager_secret_version" "jwt_secret_version" {
  secret_id     = aws_secretsmanager_secret.jwt_secret.id
  secret_string = random_password.jwt_secret_generator.result
}

locals {
  postgres_secret_json = jsondecode(nonsensitive(data.aws_secretsmanager_secret_version.postgres_secret_version.secret_string))
}

resource "kubernetes_secret" "db_secret" {
  metadata {
    name = "db"
  }

  data = {
    DB_HOST        = sensitive(local.postgres_secret_json.host)
    DB_USERNAME    = sensitive(local.postgres_secret_json.username)
    DB_PASSWORD    = sensitive(local.postgres_secret_json.password)
    DB_DATABASE    = "landgriffon"
    DB_SYNCHRONIZE = "true"
  }
}

resource "kubernetes_secret" "api_secret" {
  metadata {
    name = "api"
  }

  data = {
    JWT_SECRET = aws_secretsmanager_secret_version.jwt_secret_version.secret_string
  }
}

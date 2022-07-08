locals {
  redis_secret_json = {
    username = "redis"
    password = random_password.redis_admin_generator.result
  }
}

resource "random_password" "redis_admin_generator" {
  length  = 24
  special = true
}

resource "aws_secretsmanager_secret" "redis_admin_secret" {
  name        = "redis-admin-credentials-${var.namespace}"
  description = "Credentials for the admin user of the K8S Redis Server"
}

resource "aws_secretsmanager_secret_version" "redis_admin_secret_version" {
  secret_id     = aws_secretsmanager_secret.redis_admin_secret.id
  secret_string = jsonencode(local.redis_secret_json)
}

resource "helm_release" "redis" {
  name       = "redis"
  repository = "https://charts.bitnami.com/bitnami"
  chart      = "redis"
  version    = "16.13.2"
  namespace  = var.namespace

  values = [
    file("${path.module}/values.yaml")
  ]

  set {
    name  = "auth.existingSecretPasswordKey"
    value = "redis-password"
  }

  set {
    name  = "auth.existingSecret"
    value = "redis-secret"
  }
}

resource "kubernetes_secret" "redis-secret" {
  metadata {
    name = "redis-secret"
    namespace  = var.namespace
  }

  data = {
    redis-password = sensitive(local.redis_secret_json.password)
  }
}

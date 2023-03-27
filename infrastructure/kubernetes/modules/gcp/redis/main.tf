resource "google_project_service" "secret_manager_api" {
  service = "secretmanager.googleapis.com"
  disable_on_destroy = false
}

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

resource "google_secret_manager_secret" "redis_admin_secret" {
  secret_id = "redis-admin-credentials-${var.namespace}"

  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }

  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "redis_admin_secret_version" {
  secret = google_secret_manager_secret.redis_admin_secret.id

  secret_data = jsonencode(local.redis_secret_json)
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
    name      = "redis-secret"
    namespace = var.namespace
  }

  data = {
    redis-password = sensitive(local.redis_secret_json.password)
  }
}

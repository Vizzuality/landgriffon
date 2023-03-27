resource "google_project_service" "secret_manager_api" {
  service            = "secretmanager.googleapis.com"
  disable_on_destroy = false
}

resource "google_secret_manager_secret" "api_secret" {
  secret_id = "api-secret-${var.namespace}"

  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }

  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "api_secret_version" {
  secret = google_secret_manager_secret.api_secret.id

  secret_data = jsonencode(local.api_secret_json)
}

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

resource "google_secret_manager_secret" "postgres_user_secret" {
  secret_id = "landgriffon-${var.namespace}-postgresql-user-password"

  replication {
    user_managed {
      replicas {
        location = var.region
      }
    }
  }

  depends_on = [google_project_service.secret_manager_api]
}

resource "google_secret_manager_secret_version" "postgres_user_secret_version" {
  secret = google_secret_manager_secret.postgres_user_secret.id

  secret_data = jsonencode(local.postgres_secret_json)
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

  data = {
    AWS_ACCESS_KEY_ID     = var.aws_access_key_id
    AWS_SECRET_ACCESS_KEY = var.aws_secret_access_key
  }
}





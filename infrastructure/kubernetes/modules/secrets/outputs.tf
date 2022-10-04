output "postgres_username" {
  value = local.postgres_secret_json.username
}

output "postgres_password" {
  value = local.postgres_secret_json.password
}

output "postgres_database" {
  value = local.postgres_secret_json.database
}

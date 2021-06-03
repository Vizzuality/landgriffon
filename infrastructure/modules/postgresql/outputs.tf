output "security_group_id" {
  value       = aws_security_group.postgresql.id
  description = "Security group ID to access postgresql database"
}

output "secrets_postgresql-writer_arn" {
  value = aws_secretsmanager_secret.postgresql-admin.arn
}

output "secrets_postgresql-writer_name" {
  value = aws_secretsmanager_secret.postgresql-admin.name
}

output "secrets_postgresql-writer_policy_arn" {
  value = aws_iam_policy.secrets_postgresql-writer.arn
}

output "username" {
  value     = module.db.db_instance_username
  sensitive = true
}

output "host" {
  value = module.db.db_instance_address
}

output "port" {
  value = module.db.db_instance_port
}

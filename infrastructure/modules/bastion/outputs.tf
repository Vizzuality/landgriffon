output "bastion_hostname" {
  value       = aws_instance.bastion.public_dns
  description = "Bastion hostname for SSH access."
}

output "bastion_security_group" {
  value       = aws_security_group.bastion_security_group
  description = "Security group of the bastion"
}

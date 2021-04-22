# Output values which can be referenced in other repos
output "account_id" {
  value       = data.aws_caller_identity.current.account_id
  description = "ID of AWS account"
}

output "nat_gateway_ips" {
  value       = module.vpc.nat_gateway_ips
  description = "List of all NAT Gateway IPs"
}

output "bastion_hostname" {
  value       = module.bastion.bastion_hostname
  description = "Hostname of bastion host for VPC"
}

//output "bastion_dns" {
//  value       = cloudflare_record.bastion_dns.hostname
//  description = "DNS name of bastion host for VPC"
//}

output "vpc_id" {
  value = module.vpc.id
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.vpc.private_subnet_ids
}

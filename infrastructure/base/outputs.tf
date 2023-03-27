output "science_bucket_name" {
  value = module.s3_bucket.science_bucket_name
}

# AWS resources

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

output "vpc_id" {
  value = module.vpc.id
}

output "public_subnet_ids" {
  value = module.vpc.public_subnet_ids
}

output "private_subnet_ids" {
  value = module.vpc.private_subnet_ids
}

output "aws_api_container_registry_url" {
  value = module.api_container_registry.container_registry_url
}

output "aws_tiler_container_registry_url" {
  value = module.tiler_container_registry.container_registry_url
}

output "aws_client_container_registry_url" {
  value = module.client_container_registry.container_registry_url
}

output "aws_data_import_container_registry_url" {
  value = module.data_import_container_registry.container_registry_url
}

output "eks_cluster_host" {
  value       = module.eks.cluster.endpoint
  description = "EKS cluster endpoint"
}

output "eks_cluster_name" {
  value       = module.eks.cluster.name
  description = "EKS cluster name"
}

output "raw_s3_reader" {
  value = aws_iam_user.raw_s3_reader
}

# GCP resources

output "gke_cluster_name" {
  value       = module.gke.cluster_name
  description = "GKE cluster name"
}

output "gke_cluster_host" {
  value       = module.gke.cluster_endpoint
  description = "GKE cluster endpoint"
}

output "gcp_workload_identity_provider" {
  value = module.workload_identity.workload_identity_provider
}

output "gcp_service_account" {
  value = module.workload_identity.service_account.email
}

output "gcp_api_container_registry_url" {
  value = module.api_gcr.artifact_registry_repository_url
}

output "gcp_tiler_container_registry_url" {
  value = module.tiler_gcr.artifact_registry_repository_url
}

output "gcp_client_container_registry_url" {
  value = module.client_gcr.artifact_registry_repository_url
}

output "gcp_data_import_container_registry_url" {
  value = module.data_import_gcr.artifact_registry_repository_url
}

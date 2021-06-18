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

output "postgres_host" {
  value = module.postgresql.host
}


output "kubectl_config" {
  value       = module.eks.kubeconfig
  description = "Configuration snippet for the kubectl CLI tool that allows access to this EKS cluster"
}

locals {
  kube_configmap = <<KUBECONFIGMAP
apiVersion: v1
kind: ConfigMap
metadata:
  name: aws-auth
  namespace: kube-system
data:
  mapRoles: |
    - rolearn: ${module.bastion.eks_manager_role.arn}
      username: system:node:{{EC2PrivateDNSName}}
      groups:
        - system:masters
    - rolearn: ${module.eks.node_role_arn}
      username: system:node:{{EC2PrivateDNSName}}
      groups:
        - system:bootstrappers
        - system:nodes

KUBECONFIGMAP
}

output "kube_configmap" {
  value = local.kube_configmap
}

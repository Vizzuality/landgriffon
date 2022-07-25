output "cluster" {
  value = aws_eks_cluster.eks_cluster
}

output "cluster_name" {
  value = aws_eks_cluster.eks_cluster.name
}

output "endpoint" {
  value = aws_eks_cluster.eks_cluster.endpoint
}

output "kubeconfig-certificate-authority-data" {
  value = aws_eks_cluster.eks_cluster.certificate_authority.0.data
}

output "node_role_arn" {
  value = aws_iam_role.eks-node-group-iam-role.arn
}

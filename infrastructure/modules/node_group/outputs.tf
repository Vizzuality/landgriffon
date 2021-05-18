output "node_group_name" {
  value       = aws_eks_node_group.eks-node-group.node_group_name
  description = "Node group name"
}
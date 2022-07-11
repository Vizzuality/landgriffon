data "aws_eks_node_groups" "node_groups" {
  cluster_name = var.cluster_name
}

data "aws_eks_node_group" "node_group" {
  cluster_name = var.cluster_name

  node_group_name = tolist(data.aws_eks_node_groups.node_groups.names)[0]
}

resource "random_id" "eks-node-group" {
  keepers = {
    instance_types = var.instance_types
    namespace      = var.namespace
  }
  byte_length = 8
}

resource "aws_eks_node_group" "eks-node-group" {
  cluster_name    = var.cluster_name
  node_group_name = "${var.node_group_name}-${random_id.eks-node-group.hex}"
  node_role_arn   = data.aws_eks_node_group.node_group.node_role_arn
  subnet_ids      = var.subnet_ids

  scaling_config {
    desired_size = var.desired_size
    max_size     = var.max_size
    min_size     = var.min_size
  }

  instance_types = [random_id.eks-node-group.keepers.instance_types]
  disk_size      = var.instance_disk_size

  labels = var.labels

  tags = {
    node_group_name = var.node_group_name
  }

  lifecycle {
    ignore_changes        = [scaling_config[0].desired_size]
    create_before_destroy = false
  }
}


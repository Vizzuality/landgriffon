resource "random_id" "eks-node-group" {
  keepers = {
    # Generate a new id each time we make changes to the instance type
    # In case TF gets stuck during apply, we can taint this resource to force TF
    # to create a new random ID
    # `terraform taint module.core-node-group.random_id.eks_node_group`
    instance_types = var.instance_types
  }
  byte_length = 8
}

data "aws_ssm_parameter" "eks_ami_release_version" {
  name = "/aws/service/eks/optimized-ami/${var.cluster.version}/amazon-linux-2/recommended/release_version"
}

resource "aws_eks_node_group" "eks-node-group" {
  cluster_name    = var.cluster_name
  node_group_name = "${var.node_group_name}-${random_id.eks-node-group.hex}"
  node_role_arn   = var.node_role_arn
  version         = var.cluster.version
  release_version = nonsensitive(data.aws_ssm_parameter.eks_ami_release_version.value)
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

  depends_on = [
    var.cluster
  ]

  lifecycle {
    ignore_changes        = [scaling_config[0].desired_size]
    create_before_destroy = false
  }
}


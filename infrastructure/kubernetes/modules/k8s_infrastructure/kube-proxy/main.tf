locals {
  oicd_id = element(split("/", data.aws_eks_cluster.eks_cluster.identity.0.oidc.0.issuer), length(split("/", data.aws_eks_cluster.eks_cluster.identity.0.oidc.0.issuer)) - 1)
}

data "aws_caller_identity" "current" {}

data "aws_eks_cluster" "eks_cluster" {
  name = var.cluster_name
}

resource "aws_eks_addon" "aws_kube_proxy" {
  cluster_name             = data.aws_eks_cluster.eks_cluster.name
  addon_name               = "kube-proxy"
  addon_version            = var.kube_proxy_addon_version
}

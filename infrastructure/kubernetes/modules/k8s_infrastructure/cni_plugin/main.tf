locals {
  oicd_id = element(split("/", data.aws_eks_cluster.eks_cluster.identity.0.oidc.0.issuer), length(split("/", data.aws_eks_cluster.eks_cluster.identity.0.oidc.0.issuer)) - 1)
}

data "aws_caller_identity" "current" {}

data "aws_eks_cluster" "eks_cluster" {
  name = var.cluster_name
}

resource "aws_eks_addon" "aws_vpc_cni" {
  cluster_name             = data.aws_eks_cluster.eks_cluster.name
  addon_name               = "vpc-cni"
  addon_version            = var.vpc_cni_addon_version
  service_account_role_arn = aws_iam_role.vpc_cni_role.arn
}

resource "aws_iam_role" "vpc_cni_role" {
  name = "AmazonEKSVPCCNIRole"

  assume_role_policy = jsonencode({
    Version : "2012-10-17",
    Statement : [
      {
        Effect : "Allow",
        Principal : {
          "Federated" : "arn:aws:iam::${data.aws_caller_identity.current.account_id}:oidc-provider/oidc.eks.${var.aws_region}.amazonaws.com/id/${local.oicd_id}"
        },
        Action : "sts:AssumeRoleWithWebIdentity",
        Condition : {
          StringEquals : {
            "oidc.eks.${var.aws_region}.amazonaws.com/id/${local.oicd_id}:aud" : "sts.amazonaws.com",
            "oidc.eks.${var.aws_region}.amazonaws.com/id/${local.oicd_id}:sub" : "system:serviceaccount:kube-system:aws-node"
          }
        }
      }
    ]
  })
}

data "aws_iam_role" "eks_node_group_admin" {
  name = "eks-node-group-admin"
}

resource "aws_iam_role_policy_attachment" "eks_cluster_vpc_cni_policy_attachment" {
  role       = aws_iam_role.vpc_cni_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
}

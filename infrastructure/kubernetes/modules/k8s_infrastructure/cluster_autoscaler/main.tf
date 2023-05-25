// https://docs.aws.amazon.com/eks/latest/userguide/cluster-autoscaler.html
// AWS Cluster autoscaler
// File has changes - see link above for details
data "kubectl_path_documents" "cluster_autoscaler_manifests" {
  pattern = "${path.module}/cluster-autoscaler-autodiscover.yaml.tmpl"
  vars = {
    cluster_name : var.cluster_name
    role_name: local.role_name
    aws_account_id: data.aws_caller_identity.current.account_id
  }
}

resource "kubectl_manifest" "cluster_autoscaler" {
  count     = length(data.kubectl_path_documents.cluster_autoscaler_manifests.documents)
  yaml_body = element(data.kubectl_path_documents.cluster_autoscaler_manifests.documents, count.index)
}

#
# Custom resources to set up IAM access
#

data "aws_eks_cluster" "eks_cluster" {
  name = var.cluster_name
}

data "aws_caller_identity" "current" {}

locals {
  oicd_id = element(split("/", data.aws_eks_cluster.eks_cluster.identity.0.oidc.0.issuer), length(split("/", data.aws_eks_cluster.eks_cluster.identity.0.oidc.0.issuer)) - 1)
  role_name = "eks-cluster-autoscaler"
}

resource "aws_iam_role" "eks_cluster_autoscaler_role" {
  name = local.role_name
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
            "oidc.eks.${var.aws_region}.amazonaws.com/id/${local.oicd_id}:sub" : "system:serviceaccount:kube-system:cluster-autoscaler"
          }
        }
      }
    ]
  })
}


resource "aws_iam_policy" "eks_cluster_autoscaler_policy" {
  name = "eks_cluster_autoscaler_policy"

  policy = jsonencode({
    Statement = [
      {
        Action = [
          "autoscaling:DescribeAutoScalingGroups",
          "autoscaling:DescribeAutoScalingInstances",
          "autoscaling:DescribeLaunchConfigurations",
          "autoscaling:DescribeScalingActivities",
          "autoscaling:DescribeTags",
          "ec2:DescribeInstanceTypes",
          "ec2:DescribeLaunchTemplateVersions"
        ]
        Effect   = "Allow"
        Resource = ["*"]
      },
      {
        Effect   = "Allow"
        Resource = ["*"]
        Action   = [
          "autoscaling:SetDesiredCapacity",
          "autoscaling:TerminateInstanceInAutoScalingGroup",
          "ec2:DescribeImages",
          "ec2:GetInstanceTypesFromInstanceRequirements",
          "eks:DescribeNodegroup"
        ]
      }
    ]
    Version = "2012-10-17"
  })
}

data "aws_iam_role" "eks_node_group_admin" {
  name = "eks-node-group-admin"
}

resource "aws_iam_role_policy_attachment" "eks_cluster_autoscaler_policy_attachment" {
  role       = aws_iam_role.eks_cluster_autoscaler_role.name
  policy_arn = aws_iam_policy.eks_cluster_autoscaler_policy.arn
}

resource "aws_iam_role_policy_attachment" "eks-admin-ClusterAutoscalerAccessPolicy" {
  policy_arn = aws_iam_policy.eks_cluster_autoscaler_policy.arn
  role       = data.aws_iam_role.eks_node_group_admin.name
}

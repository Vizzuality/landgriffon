data "aws_eks_cluster_auth" "cluster" {
  name = var.cluster_name
}

// https://docs.aws.amazon.com/eks/latest/userguide/cluster-autoscaler.html
// AWS Cluster autoscaler
// File has changes - see link above for details
data "kubectl_path_documents" "cluster_autoscaler_manifests" {
  pattern = "${path.module}/cluster_autoscaler/cluster-autoscaler-autodiscover.yaml.tmpl"
  vars = {
    cluster_name : var.cluster_name
  }
}

resource "kubectl_manifest" "cluster_autoscaler" {
  count     = length(data.kubectl_path_documents.cluster_autoscaler_manifests.documents)
  yaml_body = element(data.kubectl_path_documents.cluster_autoscaler_manifests.documents, count.index)
}

// https://docs.aws.amazon.com/eks/latest/userguide/metrics-server.html
// AWS Metrics server for HPA support
// File has no changes
data "kubectl_path_documents" "metrics_server_manifests" {
  pattern = "${path.module}/metrics_server/metrics_server.yaml"
}

resource "kubectl_manifest" "metrics_server" {
  count     = var.deploy_metrics_server ? length(data.kubectl_path_documents.metrics_server_manifests.documents) : 0
  yaml_body = element(data.kubectl_path_documents.metrics_server_manifests.documents, count.index)
}

// https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Container-Insights-setup-EKS-quickstart.html
// Container insights
// File has changes - see link above for details
data "kubectl_path_documents" "container_insights_manifests" {
  pattern = "${path.module}/container_insights/container_insights.yaml.tmpl"
  vars = {
    aws_region : var.aws_region,
    cluster_name : var.cluster_name
  }
}

resource "kubectl_manifest" "container_insights" {
  count     = length(data.kubectl_path_documents.container_insights_manifests.documents)
  yaml_body = element(data.kubectl_path_documents.container_insights_manifests.documents, count.index)
}

// https://github.com/aws/amazon-vpc-cni-k8s/releases
// AWS VPC CNI plugin for Kubernetes
// File has changes - see link above for details
data "kubectl_path_documents" "cni_plugin_manifests" {
  pattern = "${path.module}/cni_plugin/aws-k8s-cni-v1.11.yaml"
}

resource "kubectl_manifest" "cni_plugin" {
  count     = length(data.kubectl_path_documents.cni_plugin_manifests.documents)
  yaml_body = element(data.kubectl_path_documents.cni_plugin_manifests.documents, count.index)
}

module "lb_controller" {
  source       = "./lb_controller"
  cluster_name = var.cluster_name
  aws_region   = var.aws_region
}

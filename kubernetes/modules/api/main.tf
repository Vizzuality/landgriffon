resource "kubernetes_service" "api_service" {
  metadata {
    name = "bigquery"

  }
  spec {
    selector = {
      name = "bigquery"
    }
    port {
      port        = 30506
      node_port   = 30506
      target_port = 3095
    }

    type = "NodePort"
  }
}

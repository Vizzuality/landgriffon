resource "google_compute_global_address" "gateway_static_ip" {
  name         = "cluster-ip"
  address_type = "EXTERNAL"
  project      = var.project
}

locals {
  api_domain    = "api.${var.namespace != "production" ? ("${var.namespace}.") : ""}${var.domain}"
  client_domain = "client.${var.namespace != "production" ? ("${var.namespace}.") : ""}${var.domain}"
}

resource "kubernetes_manifest" "http_to_https" {
  manifest = {
    apiVersion = "networking.gke.io/v1beta1"
    kind       = "FrontendConfig"

    metadata = {
      name      = "http-to-https"
      namespace = var.namespace
    }

    spec = {
      redirectToHttps = {
        enabled          = true
        responseCodeName = "MOVED_PERMANENTLY_DEFAULT"
      }
    }
  }
}

resource "kubernetes_manifest" "langriffon_managed_cert" {
  manifest = {
    apiVersion = "networking.gke.io/v1"
    kind       = "ManagedCertificate"
    metadata   = {
      name      = "langriffon-managed-cert"
      namespace = var.namespace
    }
    spec = {
      domains : [local.api_domain, local.client_domain]
    }
  }
}

resource "kubernetes_ingress_v1" "gateway_ingress" {
  metadata {
    name        = "gateway-ingress"
    namespace   = var.namespace
    annotations = {
      "kubernetes.io/ingress.global-static-ip-name" = google_compute_global_address.gateway_static_ip.name
      "networking.gke.io/managed-certificates"      = "langriffon-managed-cert"
      "kubernetes.io/ingress.class"                 = "gce"
      "networking.gke.io/v1beta1.FrontendConfig"    = kubernetes_manifest.http_to_https.object.metadata.name
    }
  }

  spec {
    rule {
      host = local.api_domain
      http {
        path {
          path_type = "Prefix"
          path      = "/tiler"
          backend {
            service {
              name = "tiler"
              port {
                number = 4000
              }
            }
          }
        }
      }
    }

    rule {
      host = local.api_domain
      http {
        path {
          backend {
            service {
              name = "api"
              port {
                number = 3000
              }
            }
          }
        }
      }
    }

    rule {
      host = local.client_domain
      http {
        path {
          backend {
            service {
              name = "client"
              port {
                number = 3000
              }
            }
          }
        }
      }
    }
  }
}

data "aws_route53_zone" "landgriffon-com" {
  name = "landgriffon.com."
}

resource "aws_route53_record" "api-landgriffon-com" {
  zone_id = data.aws_route53_zone.landgriffon-com.zone_id
  name    = local.api_domain
  type    = "A"
  ttl     = "300"
  records = [google_compute_global_address.gateway_static_ip.address]
}

resource "aws_route53_record" "client-landgriffon-com" {
  zone_id = data.aws_route53_zone.landgriffon-com.zone_id
  name    = local.client_domain
  type    = "A"
  ttl     = "300"
  records = [google_compute_global_address.gateway_static_ip.address]
}

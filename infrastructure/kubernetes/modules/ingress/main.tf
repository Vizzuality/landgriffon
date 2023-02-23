data "aws_eks_cluster_auth" "cluster" {
  name = var.cluster_name
}

locals {
  api_domain      = "api.${var.namespace != "production" ? ("${var.namespace}.") : ""}${var.domain}"
  client_domain   = "client.${var.namespace != "production" ? ("${var.namespace}.") : ""}${var.domain}"
}

data "aws_route53_zone" "landgriffon-com" {
  name = "landgriffon.com."
}

resource "aws_acm_certificate" "landgriffon_cert" {
  domain_name               = local.api_domain
  subject_alternative_names = [local.client_domain]
  validation_method         = "DNS"
}

resource "aws_route53_record" "landgriffon-com-record" {
  for_each = {
    for dvo in aws_acm_certificate.landgriffon_cert.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.landgriffon-com.zone_id
}

resource "aws_route53_record" "api-landgriffon-com" {
  zone_id = data.aws_route53_zone.landgriffon-com.zone_id
  name    = local.api_domain
  type    = "CNAME"
  ttl     = "300"
  records = [kubernetes_ingress_v1.landgriffon.status[0].load_balancer[0].ingress[0].hostname]
}

resource "aws_route53_record" "client-landgriffon-com" {
  zone_id = data.aws_route53_zone.landgriffon-com.zone_id
  name    = local.client_domain
  type    = "CNAME"
  ttl     = "300"
  records = [kubernetes_ingress_v1.landgriffon.status[0].load_balancer[0].ingress[0].hostname]
}

resource "aws_acm_certificate_validation" "aws_env_resourcewatch_org_domain_cert_validation" {
  certificate_arn         = aws_acm_certificate.landgriffon_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.landgriffon-com-record : record.fqdn]
}

resource "kubernetes_ingress_v1" "landgriffon" {
  wait_for_load_balancer = true

  metadata {
    name      = "landgriffon"
    namespace = var.namespace
    annotations = {
      "kubernetes.io/ingress.class"                    = "alb"
      "alb.ingress.kubernetes.io/scheme"               = "internet-facing"
      "alb.ingress.kubernetes.io/healthcheck-path"     = "/health"
      "alb.ingress.kubernetes.io/certificate-arn"      = aws_acm_certificate_validation.aws_env_resourcewatch_org_domain_cert_validation.certificate_arn
      "alb.ingress.kubernetes.io/listen-ports"         = "[{\"HTTP\": 80}, {\"HTTPS\": 443}]"
      "alb.ingress.kubernetes.io/actions.ssl-redirect" = "{\"Type\": \"redirect\", \"RedirectConfig\": { \"Protocol\": \"HTTPS\", \"Port\": \"443\", \"StatusCode\": \"HTTP_301\"}}"
    }
  }

  spec {
    tls {
      hosts = [
        local.api_domain,
        local.client_domain,
      ]
      secret_name = "landgriffon-certificate"
    }

    default_backend {
      service {
        name = "api"
        port {
          number = 3000
        }
      }
    }

    rule {
      http {
        path {
          backend {
            service {
              name = "ssl-redirect"
              port {
                name = "use-annotation"
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

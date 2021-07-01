data "aws_eks_cluster_auth" "cluster" {
  name = var.cluster_name
}

provider "kubernetes" {
  host                   = var.cluster_endpoint
  cluster_ca_certificate = base64decode(var.cluster_ca)
  token                  = data.aws_eks_cluster_auth.cluster.token
}

data "aws_route53_zone" "landgriffon-com" {
  name = "landgriffon.com."
}

resource "aws_acm_certificate" "landgriffon_cert" {
  domain_name               = "api.landgriffon.com"
  subject_alternative_names = ["client.landgriffon.com"]
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
  name    = "api.landgriffon.com"
  type    = "CNAME"
  ttl     = "300"
  records = [kubernetes_ingress.landgriffon.status[0].load_balancer[0].ingress[0].hostname]
}

resource "aws_route53_record" "client-landgriffon-com" {
  zone_id = data.aws_route53_zone.landgriffon-com.zone_id
  name    = "client.landgriffon.com"
  type    = "CNAME"
  ttl     = "300"
  records = [kubernetes_ingress.landgriffon.status[0].load_balancer[0].ingress[0].hostname]
}

resource "aws_acm_certificate_validation" "aws_env_resourcewatch_org_domain_cert_validation" {
  certificate_arn         = aws_acm_certificate.landgriffon_cert.arn
  validation_record_fqdns = [for record in aws_route53_record.landgriffon-com-record : record.fqdn]
}

resource "kubernetes_ingress" "landgriffon" {
  wait_for_load_balancer = true

  metadata {
    name = "landgriffon"
    annotations = {
      "kubernetes.io/ingress.class"                = "alb"
      "alb.ingress.kubernetes.io/scheme"           = "internet-facing"
      "alb.ingress.kubernetes.io/healthcheck-path" = "/health_check"
      "alb.ingress.kubernetes.io/certificate-arn"  = aws_acm_certificate_validation.aws_env_resourcewatch_org_domain_cert_validation.certificate_arn
      "alb.ingress.kubernetes.io/listen-ports"     = "[{\"HTTP\": 80}, {\"HTTPS\": 443}]"
    }
  }

  spec {
    tls {
      hosts = [
        "api.landgriffon.com",
        "client.landgriffon.com"
      ]
      secret_name = "landgriffon-certificate"
    }

    backend {
      service_name = "api"
      service_port = 3000
    }

    rule {
      host = "api.landgriffon.com"
      http {
        path {
          backend {
            service_name = "api"
            service_port = 3000
          }
        }
      }
    }

    rule {
      host = "client.landgriffon.com"
      http {
        path {
          backend {
            service_name = "client"
            service_port = 3000
          }
        }
      }
    }
  }
}

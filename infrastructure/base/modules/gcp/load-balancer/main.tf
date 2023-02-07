// IP address
resource "google_compute_global_address" "ip_address" {
  name         = "${var.name}-lb"
  ip_version   = "IPV4"
  address_type = "EXTERNAL"
}

locals {
  domain = var.subdomain == "" ? var.domain : "${var.subdomain}.${var.domain}"
}

# ------------------------------------------------------------------------------
# Load balancer config rules
# ------------------------------------------------------------------------------

# HTTPS + certificate handling
resource "google_compute_global_forwarding_rule" "load-balancer-forwarding-rule-https" {
  name                  = "${var.name}-lb-forwarding-rule-https"
  target                = google_compute_target_https_proxy.load-balancer-https-proxy.id
  port_range            = "443"
  load_balancing_scheme = "EXTERNAL"
  ip_address            = google_compute_global_address.ip_address.address
}

resource "google_compute_target_https_proxy" "load-balancer-https-proxy" {
  name             = "${var.name}-lb-https-proxy"
  url_map          = google_compute_url_map.load-balancer-url-map.id
  ssl_certificates = [google_compute_managed_ssl_certificate.load-balancer-certificate.id]
}

resource "google_compute_managed_ssl_certificate" "load-balancer-certificate" {
  name = "${var.name}-lb-cert"

  managed {
    domains = [local.domain]
  }
}

# HTTP redirection to HTTPS
resource "google_compute_url_map" "http-redirect" {
  name = "${var.name}-http-redirect"

  default_url_redirect {
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"  // 301 redirect
    strip_query            = false
    https_redirect         = true  // this is the magic
  }
}

resource "google_compute_target_http_proxy" "http-redirect" {
  name    = "${var.name}-http-redirect"
  url_map = google_compute_url_map.http-redirect.self_link
}

resource "google_compute_global_forwarding_rule" "http-redirect" {
  name       = "${var.name}-http-redirect"
  target     = google_compute_target_http_proxy.http-redirect.self_link
  ip_address = google_compute_global_address.ip_address.address
  port_range = "80"
}

# ------------------------------------------------------------------------------
# Load balancer core (URL mapping)
# ------------------------------------------------------------------------------
resource "google_compute_url_map" "load-balancer-url-map" {
  name            = "${var.name}-lb"
  description     = "Load balancer for ${var.name}"
  default_service = google_compute_backend_service.frontend_service.id

  host_rule {
    hosts        = [local.domain]
    path_matcher = "site"
  }

  path_matcher {
    name            = "site"
    default_service = google_compute_backend_service.frontend_service.id
  }
}

resource "google_compute_region_network_endpoint_group" "cloudrun_frontend_neg" {
  name                  = "${var.name}-frontend-neg"
  network_endpoint_type = "SERVERLESS"
  region                = var.region
  cloud_run {
    service = var.frontend_cloud_run_name
  }
}

resource "google_compute_backend_service" "frontend_service" {
  name        = "${var.name}-frontend-service"
  description = "${var.name} frontend service"

  backend {
    group = google_compute_region_network_endpoint_group.cloudrun_frontend_neg.id
  }
}

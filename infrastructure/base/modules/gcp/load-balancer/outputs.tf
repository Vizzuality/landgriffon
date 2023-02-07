output "load-balancer-ip" {
  description = "The public IP address of the load balancer"
  value       = google_compute_global_address.ip_address.address
}

output "load-balancer-names" {
  value = google_compute_managed_ssl_certificate.load-balancer-certificate.managed.*.domains
}

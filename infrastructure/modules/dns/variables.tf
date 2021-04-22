variable "domain" {
  type        = string
  description = "The base domain name"
}

variable "site_server_ip_list" {
  type        = list(string)
  description = "The IP address list of page server"
}

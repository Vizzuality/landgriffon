resource "aws_route53_zone" "landgriffon-com" {
  name = var.domain
}

resource "aws_route53_record" "homepage" {
  zone_id = aws_route53_zone.landgriffon-com.zone_id
  name    = var.domain
  type    = "A"
  ttl     = "300"
  records = var.site_server_ip_list
}

resource "aws_route53_record" "homepage-www" {
  zone_id = aws_route53_zone.landgriffon-com.zone_id
  name    = "www.${var.domain}"
  type    = "A"
  ttl     = "300"
  records = var.site_server_ip_list
}

resource "aws_route53_record" "bastion" {
  zone_id = aws_route53_zone.landgriffon-com.zone_id
  name    = "bastion.${var.domain}"
  type    = "CNAME"
  ttl     = "300"
  records = [var.bastion_hostname]
}

resource "aws_route53_record" "supply-chain" {
  zone_id = aws_route53_zone.landgriffon-com.zone_id
  name    = "supplychain.${var.domain}"
  type    = "CNAME"
  ttl     = "300"
  records = ["cname.vercel-dns.com."]
}

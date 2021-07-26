// PostgreSQL Access Security Group
// Allow to forward request to PostgreSQL

resource "aws_security_group" "postgresql" {
  vpc_id      = module.vpc.id
  description = "Bastion SG allowing access to the Postgres SG"

  tags = merge(
    {
      Name = "${var.project_name}-bastion-postgres"
    },
    local.tags
  )
}


resource "aws_security_group_rule" "port_forward_postgres" {
  type                     = "egress"
  from_port                = module.postgresql.port
  to_port                  = module.postgresql.port
  protocol                 = "-1"
  source_security_group_id = module.postgresql.security_group_id
  security_group_id        = aws_security_group.postgresql.id
}

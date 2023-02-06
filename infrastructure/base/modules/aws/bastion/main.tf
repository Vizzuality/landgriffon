#
# Bastion default Security Groups
# - Ingress + Egress on port 22 from www
#
resource "aws_security_group" "bastion_security_group" {
  vpc_id      = var.vpc.id
  description = "Default security group for the bastion host"

  tags = merge(
    {
      Name = "bastion-sg"
    },
    var.tags
  )
}

resource "aws_security_group_rule" "ssh_ingress" {
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = ["0.0.0.0/0"]
  security_group_id = aws_security_group.bastion_security_group.id
}

resource "aws_security_group_rule" "ssh_egress" {
  type        = "egress"
  from_port   = 22
  to_port     = 22
  protocol    = "tcp"
  cidr_blocks = [var.vpc.cidr_block]

  security_group_id = aws_security_group.bastion_security_group.id
}

resource "aws_security_group_rule" "https_egress" {
  type        = "egress"
  from_port   = 443
  to_port     = 443
  protocol    = "tcp"
  cidr_blocks = [var.vpc.cidr_block]

  security_group_id = aws_security_group.bastion_security_group.id
}

#
# Bastion resources
#
resource "aws_iam_role" "eks_manager" {
  name = "eks_manager"

  assume_role_policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": "sts:AssumeRole",
            "Principal": {
               "Service": "ec2.amazonaws.com"
            },
            "Effect": "Allow",
            "Sid": ""
        }
    ]
}
EOF
}

# IAM Role for bastion host
resource "aws_iam_instance_profile" "bastion_profile" {
  name = "bastion_profile"
  role = aws_iam_role.eks_manager.name

  depends_on = [
    aws_iam_role.eks_manager
  ]
}

resource "aws_instance" "bastion" {
  ami                         = var.bastion_ami
  availability_zone           = var.availability_zones[0]
  ebs_optimized               = true
  instance_type               = var.bastion_instance_type
  monitoring                  = true
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = [aws_security_group.bastion_security_group.id]
  associate_public_ip_address = true
  user_data                   = var.user_data
  iam_instance_profile        = aws_iam_instance_profile.bastion_profile.name

  lifecycle {
    ignore_changes = [ami, user_data]
  }

  tags = merge(
    {
      Name = "${var.project}-Bastion"
    },
    var.tags
  )
}

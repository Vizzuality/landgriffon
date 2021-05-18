# Require TF version to be same as or greater than 0.15.0
terraform {
  backend "s3" {
    region              = "eu-west-3"
    key                 = "core.tfstate"
    dynamodb_table      = "aws-locks"
    encrypt             = true
  }
}

module "bootstrap" {
  source               = "./modules/bootstrap"
  s3_bucket            = var.tf_state_bucket
  dynamo_db_table_name = var.dynamo_db_lock_table_name
  tags                 = local.tags
}

# Internal module which defines the VPC
module "vpc" {
  source  = "./modules/vpc"
  region  = var.aws_region
  project = var.project_name
  tags    = local.tags
}

module "bastion" {
  source             = "./modules/bastion"
  bastion_ami        = data.aws_ami.latest-ubuntu-lts.id
  project            = var.project_name
  tags               = local.tags
  region             = var.aws_region
  subnet_id          = module.vpc.public_subnet_ids[0]
  vpc                = module.vpc
  user_data          = data.template_file.bastion_setup.rendered
  security_group_ids = [aws_security_group.postgresql.id]
}

module "dns" {
  source = "./modules/dns"
  domain = var.domain
  site_server_ip_list = [
    "185.199.108.153",
    "185.199.109.153",
    "185.199.110.153",
    "185.199.111.153"
  ]
  bastion_hostname = module.bastion.bastion_hostname
}

module "postgresql" {
  source                      = "./modules/postgresql"
  availability_zone_names     = [module.vpc.private_subnets[0].availability_zone, module.vpc.private_subnets[1].availability_zone, module.vpc.private_subnets[2].availability_zone]
  log_retention_period        = var.rds_log_retention_period
  private_subnet_ids          = [module.vpc.private_subnets[0].id, module.vpc.private_subnets[1].id, module.vpc.private_subnets[2].id]
  project                     = var.project_name
  rds_backup_retention_period = var.rds_backup_retention_period
  rds_db_name                 = "landgriffon"
  rds_user_name               = "postgres"
  rds_engine_version          = var.rds_engine_version
  rds_instance_class          = var.rds_instance_class
  rds_instance_count          = var.rds_instance_count
  tags                        = local.tags
  vpc_id                      = module.vpc.id
  rds_port                    = 5432
  vpc_cidr_block              = module.vpc.cidr_block
}

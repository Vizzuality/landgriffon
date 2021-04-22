# Require TF version to be same as or greater than 0.12.13
terraform {
  backend "s3" {
    region         = "eu-west-3"
    key            = "core.tfstate"
    dynamodb_table = "aws-locks"
    encrypt        = true
    allowed_account_ids = [var.allowed_account_id]
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
  source      = "./modules/bastion"
  bastion_ami = data.aws_ami.latest-ubuntu-lts.id
  project     = var.project_name
  tags        = local.tags
  region      = var.aws_region
  subnet_id   = module.vpc.public_subnet_ids[0]
  vpc         = module.vpc
  user_data   = data.template_file.bastion_setup.rendered
}

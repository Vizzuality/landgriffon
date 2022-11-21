# Require TF version to be same as or greater than 0.15.0
terraform {
  backend "s3" {
    region         = "eu-west-3"
    key            = "core.tfstate"
    dynamodb_table = "aws-locks"
    encrypt        = true
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
  source              = "./modules/vpc"
  region              = var.aws_region
  project             = var.project_name
  tags                = local.tags
  private_subnet_tags = {
    "kubernetes.io/role/internal-elb" : 1

  }
  public_subnet_tags = {
    "kubernetes.io/role/elb" : 1
  }
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

module "dns" {
  source              = "./modules/dns"
  domain              = var.domain
  site_server_ip_list = [
    "76.76.21.21"
  ]
  bastion_hostname = module.bastion.bastion_hostname
}

module "eks" {
  source     = "./modules/eks"
  project    = var.project_name
  vpc_id     = module.vpc.id
  subnet_ids = module.vpc.private_subnets.*.id
  aws_region = var.aws_region
}

module "default-node-group" {
  source          = "./modules/node_group"
  cluster         = module.eks.cluster
  cluster_name    = module.eks.cluster_name
  node_group_name = "default-node-group"
  instance_types  = var.default_node_group_instance_types
  min_size        = var.default_node_group_min_size
  max_size        = var.default_node_group_max_size
  desired_size    = var.default_node_group_desired_size
  node_role_arn   = module.eks.node_role.arn
  subnet_ids      = module.vpc.private_subnets.*.id
  labels          = {
    type : "default"
  }
}

module "data-node-group" {
  source          = "./modules/node_group"
  cluster         = module.eks.cluster
  cluster_name    = module.eks.cluster_name
  node_group_name = "data-node-group"
  instance_types  = var.data_node_group_instance_types
  min_size        = var.data_node_group_min_size
  max_size        = var.data_node_group_max_size
  desired_size    = var.data_node_group_desired_size
  node_role_arn   = module.eks.node_role.arn
  subnet_ids      = [module.vpc.private_subnets[0].id]
  labels          = {
    type : "data"
  }
}

module "s3_bucket" {
  source = "./modules/s3_bucket"
  bucket = "landgriffon-raw-data"
}

module "api_container_registry" {
  source = "./modules/container_registry"
  name   = "api"
}

module "client_container_registry" {
  source = "./modules/container_registry"
  name   = "client"
}

module "data_import_container_registry" {
  source = "./modules/container_registry"
  name   = "data_import"
}

resource "aws_iam_policy" "raw_s3_rw_access" {
  name        = "ReadWriteAccessToRawDataS3Bucket"
  description = "Read + write access to the raw data S3 bucket"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        "Action": [
          "s3:*",
        ],
        Effect   = "Allow"
        Resource = [
          module.s3_bucket.bucket_arn,
          "${module.s3_bucket.bucket_arn}/*",
        ]
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "raw_s3_rw_access_attachment" {
  role       = module.eks.node_role.name
  policy_arn = aws_iam_policy.raw_s3_rw_access.arn
}

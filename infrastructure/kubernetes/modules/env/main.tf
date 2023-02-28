module "k8s_namespace" {
  source       = "../k8s_namespace"
  cluster_name = var.cluster_name
  namespace    = var.environment
}

module "k8s_database" {
  source       = "../database"
  cluster_name = var.cluster_name
  namespace    = var.environment
  username     = module.k8s_secrets.postgres_username
  password     = module.k8s_secrets.postgres_password
  database     = module.k8s_secrets.postgres_database

  depends_on = [
    module.k8s_namespace
  ]
}

module "k8s_redis" {
  source       = "../redis"
  cluster_name = var.cluster_name
  namespace    = var.environment

  depends_on = [
    module.k8s_namespace
  ]
}

module "k8s_api" {
  source          = "../api"
  cluster_name    = var.cluster_name
  deployment_name = "api"
  image           = "${var.api_container_registry_url}:${var.image_tag}"
  namespace       = var.environment

  secrets = concat(var.api_secrets, [
    {
      name        = "DB_HOST"
      secret_name = "db"
      secret_key  = "DB_HOST"
      }, {
      name        = "DB_USERNAME"
      secret_name = "db"
      secret_key  = "DB_USERNAME"
      }, {
      name        = "DB_PASSWORD"
      secret_name = "db"
      secret_key  = "DB_PASSWORD"
      }, {
      name        = "DB_DATABASE"
      secret_name = "db"
      secret_key  = "DB_DATABASE"
      }, {
      name        = "QUEUE_HOST"
      secret_name = "db"
      secret_key  = "REDIS_HOST"
      }, {
      name        = "GEOCODING_CACHE_HOST"
      secret_name = "db"
      secret_key  = "REDIS_HOST"
      }, {
      name        = "DB_CACHE_HOST"
      secret_name = "db"
      secret_key  = "REDIS_HOST"
      }, {
      name        = "JWT_SECRET"
      secret_name = "api"
      secret_key  = "JWT_SECRET"
      }, {
      name        = "GMAPS_API_KEY"
      secret_name = "api"
      secret_key  = "GMAPS_API_KEY"
    }
  ])

  env_vars = concat(var.api_env_vars, [
    {
      name  = "PORT"
      value = 3000
    },
    {
      name  = "JWT_EXPIRES_IN"
      value = "2h"
    },
    {
      name  = "DISTRIBUTED_MAP"
      value = "true"
    },
    {
      name  = "REQUIRE_USER_AUTH"
      value = "true"
    },
    {
      name  = "REQUIRE_USER_ACCOUNT_ACTIVATION"
      value = "true"
    },
    {
      name  = "USE_NEW_METHODOLOGY"
      value = "true"
    }
  ])

  depends_on = [
    module.k8s_namespace,
    module.k8s_database
  ]
}


module "k8s_tiler" {
  source          = "../tiler"
  cluster_name    = var.cluster_name
  deployment_name = "tiler"
  image           = "${var.tiler_container_registry_url}:${var.image_tag}"
  namespace       = var.environment


  env_vars = concat(var.tiler_env_vars, [
    {
      name  = "API_URL"
      value = "${module.k8s_api.api_service_name}.${var.environment}.svc.cluster.local"
    },
    {
      name = "API_PORT"
      // TODO: get port from api k8s service
      value = 3000
    },
    {
      name  = "S3_BUCKET_NAME"
      value = var.science_bucket_name
    },
    {
      name  = "ROOT_PATH"
      value = ""
    },
    {
      name  = "TITILER_PREFIX"
      value = "/tiler/cog"
    },
    {
      name  = "TITILER_ROUTER_PREFIX"
      value = "/tiler/cog"
    },

    {
      name = "DEFAULT_COG"
      value = "biomass.tif"
    },
    {
      name = "REQUIRE_AUTH"
      value = "false"
    }

  ])

}



module "k8s_client" {
  source          = "../client"
  cluster_name    = var.cluster_name
  deployment_name = "client"
  image           = "${var.client_container_registry_url}:${var.image_tag}"
  namespace       = var.environment
  site_url        = module.k8s_ingress.client_url
  api_url         = module.k8s_ingress.api_url

  depends_on = [
    module.k8s_namespace
  ]
}

module "k8s_data_import" {
  source       = "../data_import"
  cluster_name = var.cluster_name
  job_name     = "data-import"
  image        = "${var.data_import_container_registry_url}:${var.image_tag}"
  namespace    = var.environment
  load_data    = var.load_fresh_data
  arguments    = var.data_import_arguments

  depends_on = [
    module.k8s_namespace,
    module.k8s_database,
    module.data-import-group
  ]
}

module "k8s_secrets" {
  source             = "../secrets"
  cluster_name       = var.cluster_name
  tf_state_bucket    = var.tf_state_bucket
  aws_region         = var.aws_region
  allowed_account_id = var.allowed_account_id
  namespace          = var.environment
  gmaps_api_key      = var.gmaps_api_key

  depends_on = [
    module.k8s_namespace
  ]
}

module "k8s_ingress" {
  source             = "../ingress"
  cluster_name       = var.cluster_name
  allowed_account_id = var.allowed_account_id
  aws_region         = var.aws_region
  namespace          = var.environment
  domain             = var.domain

  depends_on = [
    module.k8s_namespace
  ]
}

module "data-import-group" {
  count              = var.load_fresh_data == true ? 1 : 0
  source             = "../node_group"
  cluster_name       = var.cluster_name
  node_group_name    = "data-import-node-group"
  instance_types     = "r5a.4xlarge"
  instance_disk_size = 750
  min_size           = 1
  max_size           = 2
  desired_size       = 1
  namespace          = var.environment
  subnet_ids         = [var.private_subnet_ids[0]]
  labels = {
    type : "data-import-${var.environment}"
  }
}

module "github_actions_frontend_secrets" {
  source    = "../github_secrets"
  repo_name = var.repo_name
  branch    = var.image_tag
  domain    = var.domain
}

#module "data_import" {
#  source = "../modules/fargate"
#  namespace        = var.environment
#  postgresql_port = module.k8s_database.postgresql_service_port
#}

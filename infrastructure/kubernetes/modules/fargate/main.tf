data "aws_secretsmanager_secret" "postgresql" {
  name = "landgriffon-${var.namespace}-postgresql-user-password"
}

data "aws_secretsmanager_secret_version" "postgresql" {
  secret_id = data.aws_secretsmanager_secret.postgresql.id
}

locals {
  postgres_username = jsondecode(data.aws_secretsmanager_secret_version.postgresql.secret_string)["username"]
  postgres_password = jsondecode(data.aws_secretsmanager_secret_version.postgresql.secret_string)["password"]
  postgres_database = jsondecode(data.aws_secretsmanager_secret_version.postgresql.secret_string)["database"]
}

resource "aws_ecs_cluster" "data-import" {
  name = "data-import"
}


resource "aws_iam_policy" "data-import-policy" {
  name = "data-import-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action : [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ],
        Effect : "Allow",
        Resource : "*"
    }]
  })
}

resource "aws_iam_role" "data-import-role" {
  assume_role_policy = jsonencode({
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
    }]
    Version = "2012-10-17"
  })
}

resource "aws_iam_role_policy_attachment" "data-import-role-attach" {
  role       = aws_iam_role.data-import-role.name
  policy_arn = aws_iam_policy.data-import-policy.arn
}


data "aws_instances" "k8s_node" {
  instance_tags = {
    "eks:cluster-name" = "landgriffon-k8s-cluster"
  }
}

resource "aws_ecs_task_definition" "data-import" {
  family                   = "data-import"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 4096
  memory                   = 65536
  execution_role_arn       = aws_iam_role.data-import-role.arn
  ephemeral_storage {
    size_in_gib = 200
  }

  container_definitions = jsonencode([
    {
      name      = "data-import"
      image     = "vizzuality/landgriffon-data-import:${var.namespace}"
      cpu       = 2048
      memory    = 8192
      essential = true
      command   = ["seed-data"]
      environment = [
        { name = "API_POSTGRES_HOST", value = data.aws_instances.k8s_node.private_ips[0] },
        { name = "API_POSTGRES_PORT", value = var.postgresql_port },
        { name = "API_POSTGRES_USERNAME", value = local.postgres_username },
        { name = "API_POSTGRES_PASSWORD", value = local.postgres_password },
        { name = "API_POSTGRES_DATABASE", value = local.postgres_database },
      ],
      logConfiguration = {
        logDriver = "awslogs",
        options = {
          awslogs-region        = "eu-west-3",
          awslogs-group         = "data-import",
          awslogs-stream-prefix = "data-import",
          awslogs-create-group  = "true"
        }
      }
    },
  ])
}

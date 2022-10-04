resource "aws_ecr_repository" "container_registry" {
  name                 = var.name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

// TEMPORARILY COMMENTED OUT TO AVOID MULTIPLE DOCKER TAGS GETTING DELETED FROM ECR

#resource "aws_ecr_lifecycle_policy" "container_registry_policy_keep_last_10" {
#  repository = aws_ecr_repository.container_registry.name
#
#  policy = <<EOF
#{
#    "rules": [
#        {
#            "rulePriority": 1,
#            "description": "Keep last 10 images",
#            "selection": {
#                "tagStatus": "any",
#                "countType": "imageCountMoreThan",
#                "countNumber": 1
#            },
#            "action": {
#                "type": "expire"
#            }
#        }
#    ]
#}
#EOF
#}

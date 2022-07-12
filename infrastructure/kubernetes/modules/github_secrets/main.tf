resource "github_actions_secret" "next_public_api_url" {
  repository       = var.repo_name
  secret_name      = "NEXT_PUBLIC_API_URL_${upper(var.branch)}"
  plaintext_value  = "https://api.${var.branch != "main" ? ("${var.branch}.") : ""}${var.domain}"
}

resource "github_actions_secret" "nextauth_url" {
  repository       = var.repo_name
  secret_name      = "NEXTAUTH_URL_${upper(var.branch)}"
  plaintext_value  = "https://client.${var.branch != "main" ? ("${var.branch}.") : ""}${var.domain}"
}

resource "random_password" "password" {
  length           = 32
  special          = true
}

resource "github_actions_secret" "nextauth_secret" {
  repository       = var.repo_name
  secret_name      = "NEXTAUTH_SECRET_${upper(var.branch)}"
  plaintext_value  = base64encode(random_password.password.result)
}

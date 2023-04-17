tf_state_bucket    = "landgriffon-tf-state"
environment        = "dev"
allowed_account_id = "622152552144"
domain             = "landgriffon.com"
repo_name          = "landgriffon"

aws_environments = {
  dev : {},
  test : {},
  tetrapack : {},
  demo : {}
}

gcp_environments = {
  gcp : {
    image_tag: "latest"
  },
}

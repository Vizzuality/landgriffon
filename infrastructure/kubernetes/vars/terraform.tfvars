tf_state_bucket          = "landgriffon-tf-state"
environment              = "dev"
allowed_account_id       = "622152552144"
domain                   = "landgriffon.com"
repo_name                = "landgriffon"
vpc_cni_addon_version    = "v1.12.6-eksbuild.2"
kube_proxy_addon_version = "v1.27.1-eksbuild.1"

aws_environments = {
  dev : {},
  test : {},
  tetrapack : {},
  demo : {},
  benjerry : {},
}

gcp_environments = {
  gcp : {
    image_tag : "latest"
  },
}

gcp_region       = "europe-west1"
gcp_zone         = "europe-west1-b"
gcp_project_id   = "landgriffon"
gmaps_api_key    = ""
mapbox_api_token = ""
sendgrid_api_key = ""


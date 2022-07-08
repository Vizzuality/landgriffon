tf_state_bucket               = "landgriffon-tf-state"
environment                   = "dev"
allowed_account_id            = "622152552144"
domain                        = "landgriffon.com"
load_fresh_data_staging       = false
load_fresh_data_prod          = false
data_import_arguments_prod    = ["seed-h3-tables"]
data_import_arguments_staging = ["seed-h3-tables"]

environments = {
  test : {
    image_tag             = "staging"
    load_fresh_data       = false
  },
}

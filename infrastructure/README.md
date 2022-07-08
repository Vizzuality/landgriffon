# Infrastructure

## Dependencies

- AWS
- Terraform + Terragrunt
- Kubectl

## Geo data seeding

For both scenarios, be sure to set the corresponding variable back to `false` and run `terragrunt apply` to destroy
the import servers, which are powerful and expensive.

### For production or staging

- On the `kubernetes` TF project, set `load_fresh_data_staging` or `load_fresh_data_prod` to true
- Run `terragrunt apply`

### For other envs

- On the `kubernetes` TF project, set `load_fresh_data` to true on the nested value inside the `environments` variable.
  See the `enviorment` module definition in the root `main.tf` file for info - look into the `for_each` default value.
- Run `terragrunt apply`

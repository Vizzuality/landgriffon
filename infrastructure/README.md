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

## Deploying new environments

The infrastructure is deployed using Terraform, and set up in a way that makes it very easy to deploy new, independent
copies of the app - environments. To do this, do the following:

- Modify `infrastructure/kubernetes/vars/terraform.tfvars` (or whichever file you're using) to add the key/value to
  the `environments` variable. The kubernetes `deployments` may fail to deploy at this stage.
- Run `terragrunt apply`
- Edit both the `deploy-to-kubernetes.yml` and `publish-docker-images.yml` Github actions files and add the name of the
  new branch that will match your deployment. Try to keep it simple (one word, no spaces, no special characters). Push
  it and wait for Github Action to finish processing.
- Apply the kubernetes project above once more. The deployments should succeed.

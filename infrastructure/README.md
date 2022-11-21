# Infrastructure

## Dependencies

- AWS
- Terraform + Terragrunt
- Kubectl

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

### The "environments" variable

The `environments` variable can hold complex values that control many aspects of the deployment, so it's worth analyzing
in detail

```terraform
environments = {
	sample : {
		api_env_vars : [
			{
				name : "ENV_VAR_NAME"
				value : "some-value"
			}
		],
		load_fresh_data : true,
		data_import_arguments : ["seed-data"],
		image_tag : "sample"
	}
}
```

`environments` is a key-value structure. The `key` (`sample` in the above example) represents the name of the deployment
and will be used for many aspects of the deployment, like subdomain generation, docker image tagging, git branching,
etc.

The `value` in the key-value pair is an object with a set of properties, all of them optional

- `api_env_vars`: a list of objects, each of which with `name` and `value`. Used to inject non-sensitive environment
  variables to the api application. Internally, other environment variables are merged with this list, the result of
  which is applied to the kubernetes deployment. There is no handling
  for overlapping environment variables name. Defaults to an empty list.
- `load_fresh_data`: if "true", it will create a new node group, and start the data importer process in that group. Said
  node group is NOT automatically destroyed upon data import completion, so be sure to set it to "false" and apply
  terraform again once the import process is over, to save costs. Defaults to "false"
- `data_import_arguments`: array of string arguments passed to the data import docker container on startup, when called
  as part of the initial data import process. Defaults to `["seed-data"]`
- `image_tag`: tag of the different docker images to pull from the container registry. Does not apply to the Redis
  image. Defaults to the same value as `key`.

### Handling production and staging

The production and staging environments are always deployed, even if they are not declared in the `environments` variable.
However, if you'd like to customize their behavior (for example, reload fresh data), you can explicitly add them to the
`environments` variable, and specify your custom values for each configuration, as you would for any other env.

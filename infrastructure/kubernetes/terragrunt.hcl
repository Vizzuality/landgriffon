terraform {
#  source = "${get_parent_terragrunt_dir()}/scripts"
  before_hook "start_bastion_tunnel" {
    commands = ["apply", "plan"]
    execute  = ["${get_parent_terragrunt_dir()}/scripts/start_tunnels.sh"]
  }

  after_hook "stop_bastion_tunnel" {
    commands     = ["apply", "plan"]
    execute      = ["${get_parent_terragrunt_dir()}/scripts/stop_tunnels.sh"]
    run_on_error = true
  }
}

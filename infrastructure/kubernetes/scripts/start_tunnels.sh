#!/usr/bin/env bash

BASTION_TUNNEL_PORT=4433
BASTION_USER="ubuntu"
BASTION_HOST=$(cd ../base && terraform output -raw bastion_hostname)
CLUSTER_HOST=$(cd ../base && terraform output -raw eks_cluster_host | cut -c9-)
echo -en "ssh -N -L ${BASTION_TUNNEL_PORT}:${CLUSTER_HOST}:443 ${BASTION_USER}@${BASTION_HOST} \n disown" >> bastion_tunnel.sh && chmod +x bastion_tunnel.sh
nohup bash bastion_tunnel.sh </dev/null >/dev/null 2>&1 &
sleep 10s

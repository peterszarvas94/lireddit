#!/bin/bash

echo What should the version be?
read version

docker build -t peterszarvas94/lireddit:$version .
docker push peterszarvas94/lireddit:$version
ssh root@YOUR_DEPLOY_IP_ADDRESS "docker pull peterszarvas94/lireddit:$version && docker tag peterszarvas94/lireddit:$version dokku/api:$version && dokku deploy api $version"

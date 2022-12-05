#!/bin/bash

echo What should the version be?
read version

docker build -t peterszarvas94/lireddit:$version .
docker push peterszarvas94/lireddit:$version
ssh root@164.92.196.23 "docker pull peterszarvas94/lireddit:$version && docker tag peterszarvas94/lireddit:$version dokku/api:$version && dokku deploy api $version"
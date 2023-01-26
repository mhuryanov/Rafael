#!/bin/bash

set -ex

docker compose exec postgres /bin/rm -rfv /var/lib/postgresql/data/ && exit 0

docker compose restart postgres

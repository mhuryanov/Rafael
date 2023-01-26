#!/bin/bash

set -e

cd /workspace

mkdir -p ./assets/staticfiles/
export NODE_OPTIONS="--max-old-space-size=4096"
export NPM_CONFIG_CAFILE="/etc/ssl/certs/ca-certificates.crt"   
echo "Installing packages"
if test -f './ci' ; then
  eval $(./ci install-runtime python-3.7.4-1 node)
else 
  eval $(ci install-runtime python-3.7.4-1 node)
fi

printf "capath=/etc/ssl/certs/\ncacert=/etc/ssl/certs/ca-certificates.crt\n" >> ~/.curlrc

echo "+++++++++++++++++++++++++PYTHON++++++++++++++++++++++++++++++"
which python
python3 -V
echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++++" 
echo "Install python dep..."
python3 -m pip install --upgrade pip
pip3 install -r ./rafael_backend/requirements.txt --progress-bar off


find ./rafael_backend/tests | grep -E "(__pycache__|\.pyc|\.pyo$)" | xargs rm -rf
echo "running pytest "

pytest ./rafael_backend

echo "Install npm Updates..."
npm install -g npm
echo "++++++++++++++++++++NODE+++++++++++++++++++++++++++++++++++"
node -v   
npm install -g node@12.13.0 --force
node -v

echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++++" 
echo "++++++++++++++++++++NPM+++++++++++++++++++++++++++++++++++"
which npm
npm -v
echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++++" 

echo "Install and build node project"
npm install --no-progress   
npm run test
npm run build

echo "Collect static files"
cd ./rafael_backend/
python ./manage.py collectstatic --noinput
git tag --points-at HEAD >./tag_file.txt
cd .. 
echo "copy to .out  .... "
mkdir -p ./.out/source/front_end/
cp -r ./rafael_backend ./.out/source
cp -r ./assets ./.out/source/
cp start_web.sh ./.out/
cp ./db_migrations.sh ./.out/
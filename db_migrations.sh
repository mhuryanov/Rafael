#!/bin/bash
cd ./source/rafael_backend
echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++++"
which python
python -V
echo "+++++++++++++++++++++++++++++++++++++++++++++++++++++++"

python manage.py makemigrations
python manage.py migrate

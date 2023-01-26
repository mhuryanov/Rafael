#!/bin/bash
cd ./source/rafael_backend
python manage.py collectstatic --noinput
echo "+++++++++++++++++++++PYTHON VER ++++++++++++++++++++++++++++++++++"
which python
python -V
echo "+++++++++++++++++++++++READY ++++++++++++++++++++++++++++++++" 
python $(which gunicorn) server.wsgi --bind $HOSTNAME:$PORT_PUBLIC --timeout 180  --workers 12 --log-file - 

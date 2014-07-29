#!/bin/bash

echo "----------------------"
echo "removendo arquivos de migracao e banco ..."
echo "----------------------"

if [ -f /data/bbx/db/database.sqlite ]
then 
    rm /data/bbx/db/database.sqlite
fi
    
find /srv/bbx/baobaxia/app/django-bbx/ -name '000*.py' -exec rm '{}' \; && echo "OK!"

. /srv/bbx/envs/bbx/bin/activate

echo "----------------------"
echo "criando banco novo..."
echo "----------------------"

python manage.py syncdb --noinput


echo "----------------------"
echo "recriando migracoes..."
echo "----------------------"

python manage.py schemamigration --initial --traceback mocambola
python manage.py schemamigration --initial --traceback mucua
python manage.py schemamigration --initial --traceback tag
python manage.py schemamigration --initial --traceback media
python manage.py schemamigration --initial --traceback repository

python manage.py migrate --all


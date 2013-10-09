#!/bin/bash

echo "----------------------"
echo "removendo arquivos de migracao e banco ..."
echo "----------------------"
rm bbx/database.sqlite
find . -name '000*.py' -exec rm '{}' \; && echo "OK!"

echo "----------------------"
echo "criando banco novo..."
echo "----------------------"
source ~/bbxenv/bin/activate
python manage.py syncdb

echo "----------------------"
echo "recriando migracoes..."
echo "----------------------"

python manage.py schemamigration --initial mocambola
python manage.py schemamigration --initial mucua
python manage.py schemamigration --initial tag
python manage.py schemamigration --initial media
python manage.py schemamigration --initial repository
python manage.py migrate --all

#!/bin/bash

echo "removendo arquivos 000*.py ..."
find . -name '000*.py' -exec rm '{}' \; && echo "OK!"

echo "recriando migracoes..."
source ~/bbxenv/bin/activate
python manage.py schemamigration --initial mocambola
python manage.py schemamigration --initial mucua
python manage.py schemamigration --initial tag
python manage.py schemamigration --initial media
python manage.py schemamigration --initial repository
python manage.py migrate --all

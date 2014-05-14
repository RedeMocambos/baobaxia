#!/bin/bash

echo "----------------------"
echo "removendo arquivos de migracao e banco ..."
echo "----------------------"

if [ -f bbx/.database.sqlite ]
then 
    rm bbx/.database.sqlite
fi
    
find . -name '000*.py' -exec rm '{}' \; && echo "OK!"

source ~/bbxenv/bin/activate


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


echo "usuário do login número 1:"
echo "zumbi@dandara.mocambos.net"
echo "livre"

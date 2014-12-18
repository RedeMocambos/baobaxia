#!/bin/bash
patch -p0 < internationalization.patch
. /srv/bbx/envs/bbx/bin/activate
python /srv/bbx/baobaxia/app/django-bbx/manage.py update_templates

#!/usr/bin/env bash
echo 'BBX Cron' 
/srv/bbx/bin/bbx-cron.sh 
#echo 'Process requests'
#/srv/bbx/bin/process-requests.sh 
# Prepare updates
 cd /srv/bbx/
source envs/bbx/bin/activate
cd baobaxia/app/django-bbx/
export DJANGO_SETTINGS_MODULE="bbx.settings"
export PYTHONPATH=$(pwd)
python utils/request_all.py
python utils/update_state.py

# -*- coding: utf-8 -*-

import subprocess

import os

from django.core.management.base import BaseCommand
from django.utils.translation import ugettext_lazy as _

from bbx.settings import REPOSITORY_DIR
from bbx.utils import logger
from media.serializers import create_objects_from_files
from repository.models import Repository
from repository.models import remove_deleted_media
from mucua.models import update_mucuas_list
from mocambola.models import create_user_from_files

#logger = logging.getLogger(__name__)

"""
Definicoes do comando para sincronizar a mucua local.
"""

class Command(BaseCommand):
    u"""Sincroniza a mucua local, a partir dos metadados e configurações do
    repositório."""
    help = 'Create media objects from new serialized objects.'
    args = '[repository name] [repository name] ...'

    def handle(self, *args, **options):
        for repository in args:
            try:
                repository_instance = Repository.objects.get(name=repository)
            except Repository.DoesNotExist:
                return False

            logger.debug('Repository sync started ... [sync_repository]')
            repository_instance.sync_repository()
            logger.debug('Repository sync ......... [update_mucua_list]')
            update_mucuas_list(repository_instance)
            logger.debug('Repository sync .... [create_user_from_files]')
            create_user_from_files(repository_instance)
            logger.debug('Repository sync . [create_objects_from_files]')
            create_objects_from_files(repository_instance)
            logger.debug('Repository sync ...... [remove_deleted_media]')
            remove_deleted_media(repository_instance)
            # Atualiza o arquivo lastSyncMark                                                                                                                                  
            path = os.path.join(REPOSITORY_DIR, repository_instance.name)
            output = subprocess.check_output(
                ["git", "log", "--pretty=format:'%H'", "-n 1"],
                cwd=path)
            logger.debug(u"%s: %s" % (_('Revision is'), output))
            logger.info('<<<')
            last_sync_mark = open(os.path.join(path, 'lastSync.txt'), 'w+')
            last_sync_mark.write(output)
            last_sync_mark.close()

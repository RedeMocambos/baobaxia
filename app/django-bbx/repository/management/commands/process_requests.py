import os
import shutil

from django.core.management.base import BaseCommand

from repository.tasks import git_annex_get
from repository.models import git_remote_get_list, git_annex_drop, git_add, git_rm
from media.models import Media, get_file_path
from bbx.settings import REPOSITORY_DIR
from bbx.utils import logger

"""
Definicoes do comando para processar os pedidos.
"""

class Command(BaseCommand):
    """Processa os pedidos em espera."""
    help = 'Process pending requests'

    def handle(self, *args, **options):
        repository = args[0]
        mucua = args[1]
        # Here we copy mucuas requests from all "linked mucuas" 
        linked_mucuas = git_remote_get_list(repository)
        requests_path = os.path.join(REPOSITORY_DIR, repository, mucua, "requests")
        if not os.path.exists(requests_path):
            os.makedirs(requests_path)

        for lmucua in linked_mucuas:
            lmucua_dir = os.path.join(REPOSITORY_DIR, repository, lmucua, "requests")
            if not os.path.isdir(lmucua_dir):
                os.mkdir(lmucua_dir)
            
            src_files = os.listdir(lmucua_dir)
            for file_name in src_files:
                full_file_name = os.path.join(lmucua_dir, file_name)
                if (os.path.isfile(full_file_name)):
                    shutil.copy(full_file_name, requests_path)
                    # TODO: Need to git add
                    logger.debug('ADDING REQUEST: ' + os.path.basename(full_file_name))
                    logger.debug('ADDED ON: ' + requests_path)
                    git_add(os.path.basename(full_file_name), requests_path)

        request_list = [uuid for uuid in os.listdir(requests_path)]

        for request_uuid in request_list:
            if os.path.isfile(os.path.join(requests_path, request_uuid)):
                try:
                    media = Media.objects.get(uuid=request_uuid)
                    media.set_is_local()
                    if media.is_local:
                        request_list = [uuid for uuid in request_list if uuid != request_uuid]
                        logger.debug('REMOVING REQUEST: ' + request_uuid)
                        git_rm(request_uuid, requests_path)
                        # Here we also git annex drop the file because
                        # it's only a "transport copy", couse of
                        # media.is_requested = False.
                        if not media.is_requested:
                            requests = []
                            # Check if we can drop, couse linked mucuas doesn't have pending request
                            for lmucua in linked_mucuas:
                                requests_path = os.path.join(REPOSITORY_DIR, 
                                                             repository, lmucua, "requests")
                                for name in os.listdir(requests_path):
                                    if os.path.isfile(os.path.join(requests_path, name)):
                                        requests.append(name)                        
                                        if request_uuid not in requests:
                                            # Check to see if origin mucua is not the current mucua
                                            if media.origin.description != mucua:
                                                git_annex_drop(media)
                        else: 
                            media.is_requested = False                    
                        media.save()
                    else:
                        repository_path = os.path.join(REPOSITORY_DIR, media.get_repository())
                        async_result = git_annex_get.delay(get_file_path(media), 
                                                           os.path.basename(media.media_file.name))
                        logger.debug(async_result.info)
                        media.save()
                except Media.DoesNotExist:
                    logger.debug('Requested media not found: {0}'.format(request_uuid))

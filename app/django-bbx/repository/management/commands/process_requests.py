import os
import shutil

from django.core.management.base import BaseCommand

from repository.tasks import git_annex_get
from repository.models import git_remote_get_list, git_annex_drop, git_add
from media.models import Media, MediaDoesNotExist, get_file_path
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
        dest = os.path.join(REPOSITORY_DIR, repository, mucua, "requests")
        for lmucua in linked_mucuas:
            src_files = os.listdir(os.path.join(REPOSITORY_DIR, repository, lmucua, "requests"))
            for file_name in src_files:
                full_file_name = os.path.join(src, file_name)
                if (os.path.isfile(full_file_name)):
                    shutil.copy(full_file_name, dest)
                    # TODO: Need to git add
                    logging.debug('ADDING REQUEST: ' + os.path.basename(full_file_name))
                    logging.debug('ADDED ON: ' + dest)
                    git_add(os.path.basename(full_file_name), dest)

        requests_path = os.path.join(REPOSITORY_DIR, repository, mucua, 'requests') 
        request_list = [uuid for uuid in os.listdir(requests_path)]

        for request_uuid in request_list:
            try:
                media = Media.objects.get(uuid=request_uuid)
                media.set_is_local()
                if media.is_local:
                    request_list = [uuid for uuid in request_list if uuid != request_uuid]
                    # Should be git rm
                    os.remove(os.path.join(requests_path, request_uuid))

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
                            git_annex_drop(media)
                            media.save()
                else:
                    repository_path = os.path.join(REPOSITORY_DIR, media.get_repository())
                    async_result = git_annex_get.delay(get_file_path(media), 
                                                       os.path.basename(media.media_file.name))
                    logger.debug(async_result.info)
                    media.save()
            except MediaDoesNotExist:
                request_list = [uuid for uuid in request_list if uuid != request_uuid]
                logger.debug('Requested media not found')
            

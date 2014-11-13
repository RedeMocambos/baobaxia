import os
import shutil

from django.core.management.base import BaseCommand

from repository.tasks import git_annex_get
from repository.models import git_remote_get_list, git_annex_drop
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

        requests_path = os.path.join(REPOSITORY_DIR, repository, mucua, 'requests') 
        request_list = [uuid for uuid in os.listdir(requests_path)]
        for request_uuid in request_list:
            try:
                media = Media.objects.get(uuid=request_uuid)
                media.set_is_local()
                if media.is_local:
                    request_list = [uuid for uuid in request_list if uuid != request_uuid]
                    # Here we also git annex drop the file because
                    # it's only a "transport copy", couse of
                    # media.is_requested = False.
                    if media.is_requested == False:
                        git_annex_drop(media)
                    else:
                        media.is_requested = False
                else:
                    request_file = open(os.path.join(requests_path, request_uuid), 'r')
                    media_path = request_file.readline()
                    request_file.close()
                    repository_path = os.path.join(REPOSITORY_DIR, media.get_repository())
                    async_result = git_annex_get.delay(get_file_path(media), 
                                                       os.path.basename(media.media_file.name))
                    logger.info(async_result.info)
                    os.remove(os.path.join(requests_path, request_uuid))
            except MediaDoesNotExist:
                request_list = [uuid for uuid in request_list if uuid != request_uuid]
                logger.debug('Requested media not found')
            

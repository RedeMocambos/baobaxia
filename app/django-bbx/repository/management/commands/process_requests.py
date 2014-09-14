import os

from django.core.management.base import BaseCommand

from repository.models import git_annex_get
from media.models import Media, MediaDoesNotExist
from bbx.settings import REPOSITORY_DIR
from bbx.utils import logger

"""
Definicoes do comando para processar os pedidos.
"""

class Command(BaseCommand):
    """Processa os pedidos em espera."""
    help = 'Process pending requests'

    def handle(self, *args, **options):
        mucua = args[0]
        requests_path = os.path.join(REPOSITORY_DIR, mucua, 'requests') 
        request_list = [uuid for uuid in os.listdir(requests_path)]
        for request_uuid in request_list:
            try:
                media = Media.objects.get(uuid=request_uuid)
                media.set_is_local()
                if media.is_local:
                    media.is_requested = False
                    request_list = [uuid for uuid in request_list if uuid != request_uuid]
                    os.remove(os.path.join(requests_path, request_uuid))
                else:
                    request_file = open(os.path.join(requests_path, request_uuid), 'r')
                    media_path = request_file.readline()
                    request_file.close()
                    repository_path = os.path.join(REPOSITORY_DIR, media.get_repository())
                    async_result = git_annex_get.delay(repository_path, media_path)
                    logger.info(async_result.info)
            except Media.DoesNotExist:
                request_list = [uuid for uuid in request_list if uuid != request_uuid]
                logger.debug('Requested media not found')
            

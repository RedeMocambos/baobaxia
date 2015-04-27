import os
import shutil

from django.core.management.base import BaseCommand

from media.models import Media, MediaDoesNotExist
from bbx.utils import logger

"""
Definicoes do comando para atualizar o estado dos medias
"""

class Command(BaseCommand):
    """Atualiza o estado dos media"""
    help = 'Atualiza o estado dos media'

    def handle(self, *args, **options):
        medias = Media.objects.all()
        
        for media in medias:
            try:
                media.save(is_syncing=True)
            except OSError, e:
                logger.debug('Requested media not found: ' + media.name)        
        

from django.core.management.base import BaseCommand, CommandError

from media.serializers import createObjectsFromFiles
from repository.models import Repository
from mucua.models import update_mucuas_list

"""
Definicoes do comando para sincronizar a mucua local.
"""

class Command(BaseCommand):
    """Sincroniza o a mucua local, a partir dos metadados e configurações do repositório."""
    help = 'Create media objects from new serialized objects.'
    args = '[repository name] [repository name] ...'

    def handle(self, *args, **options):
        for repository in args:


            try: 
                repositoryinstance = Repository.objects.get(name = repository)
                
            update_mucuas_list(repositoryinstance)
            repositoryinstance.syncRepository()                
            createObjectsFromFiles(repositoryinstance)


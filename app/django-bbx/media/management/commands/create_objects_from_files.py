from django.core.management.base import BaseCommand, CommandError

from media.serializers import createObjectsFromFiles

"""
Definicoes do comando para recriar objetos no Django a partir de media serializados em JSON.
"""

class Command(BaseCommand):
    """Recria os objetos no Django a partir dos media serializados em JSON."""
    help = 'Create media objects from new serialized objects.'
    args = '[repository name] [repository name] ...'

    def handle(self, *args, **options):
        for x in args:
            createObjectsFromFiles(x)


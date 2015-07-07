
from django.core.management.base import BaseCommand
from django.db import models

from tag.models import Tag


"""
Definicoes do comando para removes tags duplicadas
"""

class Command(BaseCommand):
    """Remove tags duplicadas"""
    help = 'Remove silenciosamente as tags duplicadas (com mesmo atributo "name")'

    def handle(self, *args, **options):
        unique_fields = ['name']

        duplicates = (Tag.objects.values(*unique_fields)
                      .order_by()
                      .annotate(max_id=models.Max('id'),
                                count_id=models.Count('id'))
                      .filter(count_id__gt=1))
        
        for duplicate in duplicates:
            (Tag.objects.filter(**{x: duplicate[x] for x in unique_fields})
             .exclude(id=duplicate['max_id'])).delete()
